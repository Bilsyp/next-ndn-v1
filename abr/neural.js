import shaka from "shaka-player";
shaka.abr.EwmaBandwidthEstimator = class {
  /** */
  constructor() {
    /**
     * A fast-moving average.
     * Half of the estimate is based on the last 2 seconds of sample history.
     * @private {!shaka.abr.Ewma}
     */
    this.fast_ = new shaka.abr.Ewma(2);

    /**
     * A slow-moving average.
     * Half of the estimate is based on the last 5 seconds of sample history.
     * @private {!shaka.abr.Ewma}
     */
    this.slow_ = new shaka.abr.Ewma(5);

    /**
     * Number of bytes sampled.
     * @private {number}
     */
    this.bytesSampled_ = 0;

    /**
     * Minimum number of bytes sampled before we trust the estimate.  If we have
     * not sampled much data, our estimate may not be accurate enough to trust.
     * If bytesSampled_ is less than minTotalBytes_, we use defaultEstimate_.
     * This specific value is based on experimentation.
     *
     * @private {number}
     */
    this.minTotalBytes_ = 128e3; // 128kB

    /**
     * Minimum number of bytes, under which samples are discarded.  Our models
     * do not include latency information, so connection startup time (time to
     * first byte) is considered part of the download time.  Because of this, we
     * should ignore very small downloads which would cause our estimate to be
     * too low.
     * This specific value is based on experimentation.
     *
     * @private {number}
     */
    this.minBytes_ = 16e3; // 16kB
  }

  /**
   * Called by the Player to provide an updated configuration any time it
   * changes.
   * Must be called at least once before init().
   *
   * @param {shaka.extern.AdvancedAbrConfiguration} config
   */
  configure(config) {
    this.minTotalBytes_ = config.minTotalBytes;
    this.minBytes_ = config.minBytes;
    this.fast_.updateAlpha(config.fastHalfLife);
    this.slow_.updateAlpha(config.slowHalfLife);
  }

  /**
   * Takes a bandwidth sample.
   *
   * @param {number} durationMs The amount of time, in milliseconds, for a
   *   particular request.
   * @param {number} numBytes The total number of bytes transferred in that
   *   request.
   */
  sample(durationMs, numBytes) {
    if (numBytes < this.minBytes_) {
      return;
    }

    const bandwidth = (8000 * numBytes) / durationMs;
    const weight = durationMs / 1000;

    this.bytesSampled_ += numBytes;
    this.fast_.sample(weight, bandwidth);
    this.slow_.sample(weight, bandwidth);
  }

  /**
   * Gets the current bandwidth estimate.
   *
   * @param {number} defaultEstimate
   * @return {number} The bandwidth estimate in bits per second.
   */
  getBandwidthEstimate(defaultEstimate) {
    if (this.bytesSampled_ < this.minTotalBytes_) {
      return defaultEstimate;
    }

    // Take the minimum of these two estimates.  This should have the effect
    // of adapting down quickly, but up more slowly.
    return Math.min(this.fast_.getEstimate(), this.slow_.getEstimate());
  }

  /**
   * @return {boolean} True if there is enough data to produce a meaningful
   *   estimate.
   */
  hasGoodEstimate() {
    return this.bytesSampled_ >= this.minTotalBytes_;
  }
};
shaka.abr.Ewma = class {
  /**zzz
   * @param {number} halfLife The quantity of prior samples (by weight) used
   *   when creating a new estimate.  Those prior samples make up half of the
   *   new estimate.
   */
  constructor(halfLife) {
    /**
     * Larger values of alpha expire historical data more slowly.
     * @private {number}
     */
    this.alpha_ = Math.exp(Math.log(0.5) / halfLife);

    /** @private {number} */
    this.estimate_ = 0;

    /** @private {number} */
    this.totalWeight_ = 0;
  }

  /**
   * Update the alpha with a new halfLife value.
   *
   * @param {number} halfLife The quantity of prior samples (by weight) used
   *   when creating a new estimate.  Those prior samples make up half of the
   *   new estimate.
   */
  updateAlpha(halfLife) {
    this.alpha_ = Math.exp(Math.log(0.5) / halfLife);
  }

  /**
   * Takes a sample.
   *
   * @param {number} weight
   * @param {number} value
   */
  sample(weight, value) {
    const adjAlpha = Math.pow(this.alpha_, weight);
    const newEstimate = value * (1 - adjAlpha) + adjAlpha * this.estimate_;

    if (!isNaN(newEstimate)) {
      this.estimate_ = newEstimate;
      this.totalWeight_ += weight;
    }
  }

  /**
   * @return {number}
   */
  getEstimate() {
    const zeroFactor = 1 - Math.pow(this.alpha_, this.totalWeight_);
    return this.estimate_ / zeroFactor;
  }
};

export class Neural {
  constructor(getBufferFullness, net) {
    this.variants_ = [];
    this.enabled_ = false;
    this.switch_ = null;
    this.net = net;
    this.config_ = null;
    this.mediaElement_ = null;
    this.lastTimeChosenMs_ = null;
    this.getBufferFullness_ = getBufferFullness;
    this.bandwidthEstimator_ = new shaka.abr.EwmaBandwidthEstimator();
    this.test = [];
  }

  init(switchCallback) {
    this.switch_ = switchCallback;
  }

  setVariants(variants) {
    this.variants_ = variants;
  }
  setMediaElement(mediaElement) {
    this.mediaElement_ = mediaElement;
  }
  configure(config) {
    // Store and use the ABR config if you're going to make it configurable.
    // You can reuse bandwidthDowngradeTarget and bandwidthUpgradeTarget,
    // or you can add new config parameters to Shaka Player that are more fit to purpose.
    this.config_ = config;
  }

  enable() {
    this.enabled_ = true;
  }

  disable() {
    this.enabled_ = false;
  }

  stop() {
    this.enabled_ = false;
    this.switch_ = null;
    this.variants_ = [];
    this.config_ = null;
    this.getBufferFullness_ = null;
    this.lastTimeChosenMs_ = null;
  }

  playbackRateChanged(rate) {
    this.playbackRate_ = rate;
  }

  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    this.bandwidthEstimator_.sample(deltaTimeMs, numBytes);
    if (allowSwitch) {
      this.suggestStreams();
    }
  }
  getDefaultBandwidth_() {
    let defaultBandwidthEstimate = this.config_.defaultBandwidthEstimate;

    // Some browsers implement the Network Information API, which allows
    // retrieving information about a user's network connection.  Tizen 3 has
    // NetworkInformation, but not the downlink attribute.
    if (
      navigator.connection &&
      navigator.connection.downlink &&
      this.config_.useNetworkInformation
    ) {
      // If it's available, get the bandwidth estimate from the browser (in
      // megabits per second) and use it as defaultBandwidthEstimate.
      defaultBandwidthEstimate = navigator.connection.downlink * 1e6;
    }
    return defaultBandwidthEstimate;
  }
  getBandwidthEstimate() {
    const defaultBandwidthEstimate = this.getDefaultBandwidth_();
    const bandwidthEstimate = this.bandwidthEstimator_.getBandwidthEstimate(
      defaultBandwidthEstimate
    );
    if (this.cmsdManager_) {
      return this.cmsdManager_.getBandwidthEstimate(bandwidthEstimate);
    }
    return bandwidthEstimate;
  }
  suggestStreams() {
    const bandwidthEstimate = this.getBandwidthEstimate();
    const currentBandwidthKbps = Math.round(bandwidthEstimate / 1000.0);
    // Penyesuaian pemilihan varian berdasarkan currentBandwidth
    const adjustedVariant = this.chooseVariant(currentBandwidthKbps);
    // Jika ada varian yang disarankan berdasarkan bandwidth, gunakan itu; jika tidak, lanjutkan dengan pemilihan berdasarkan tingkat buffer
    // const chosenVariant = this.chooseVariant(bufferLevel);

    // console.log(bufferLevel);
    if (adjustedVariant) {
      this.switch_(
        adjustedVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
  }

  neuralNetwork(currentBandwidth) {
    const result = this.net.run({ [currentBandwidth]: 1 });
    console.log(result);
    let highestValue = 0;
    let highestVariant = "";
    for (const key in result) {
      const testResult = result[key];
      if (testResult > highestValue) {
        highestValue = testResult;
        highestVariant = key;
      }
    }

    return highestVariant;
  }

  chooseVariant(currentBandwidth) {
    const sortedVariants = this.variants_.sort(
      (a, b) => b.bandwidth - a.bandwidth
    );
    const value = Number(this.neuralNetwork(currentBandwidth));
    if (value) {
      for (const variant of sortedVariants) {
        const tests = Math.round(variant.bandwidth / 1000);

        if (value == tests) {
          return variant;
        } else {
          return sortedVariants[sortedVariants.length - 1];
        }
        // return this.variants_[0];
      }
    } else {
      return sortedVariants[sortedVariants.length - 1];
    }
    // Cari varian yang memiliki bandwidth yang sesuai dengan atau di bawah currentBandwidth
  }
}
