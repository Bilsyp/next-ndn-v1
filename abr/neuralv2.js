export class Templates {
  constructor(net) {
    /** @private {?shaka.extern.AbrManager.SwitchCallback} */
    this.switch_ = null;
    /** @private {boolean} */
    this.enabled_ = false;
    /** @private {shaka.abr.EwmaBandwidthEstimator} */
    this.net = net;
    /**
     * A filtered list of Variants to choose from.
     * @private {!Array.<!shaka.extern.Variant>}
     */
    this.variants_ = [];
    /** @private {number} */
    this.playbackRate_ = 1;
    /** @private {boolean} */
    this.startupComplete_ = false;
    /**
     * The last wall-clock time, in milliseconds, when streams were chosen.
     *
     * @private {?number}
     */
    this.lastTimeChosenMs_ = null;
    /** @private {?shaka.extern.AbrConfiguration} */
    this.config_ = null;

    /** @private {?shaka.util.CmsdManager} */
    this.cmsdManager_ = null;
  }
  /**
   * Initializes the AbrManager.
   *
   * @param {shaka.extern.AbrManager.SwitchCallback} switchCallback
   * @exportDoc
   */
  init(switchCallback) {
    this.switch_ = switchCallback;
  }
  /**
   * Stops any background timers and frees any objects held by this instance.
   * This will only be called after a call to init.
   *
   * @exportDoc
   */
  stop() {
    this.switch_ = null;
    this.enabled_ = false;
    this.variants_ = [];
    this.playbackRate_ = 1;
    this.lastTimeChosenMs_ = null;
    this.mediaElement_ = null;
    if (this.resizeObserver_) {
      this.resizeObserver_.disconnect();
      this.resizeObserver_ = null;
    }
    this.resizeObserverTimer_.stop();
    this.cmsdManager_ = null;
  }
  /**
   * Request that this object release all internal references.
   * @exportDoc
   */
  release() {}
  /**
   * Updates manager's variants collection.
   *
   * @param {!Array.<!shaka.extern.Variant>} variants
   * @exportDoc
   */
  setVariants(variants) {
    this.variants_ = variants;
  }
  /**
   * Chooses one variant to switch to.  Called by the Player.
   * @param {boolean=} preferFastSwitching If not provided meant "avoid fast
   *                                       switching if possible".
   * @return {shaka.extern.Variant}
   * @exportDoc
   */
  chooseVariant(preferFastSwitching) {
    console.log("ok");
    return this.variants_[0];
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
  neuralNetwork(currentBandwidth) {
    const result = this.net.run({ [currentBandwidth]: 1 });
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
  adjustVariantByBandwidth(currentBandwidth) {
    const sortedVariants = this.variants_.sort(
      (a, b) => b.bandwidth - a.bandwidth
    );
    const value = Number(this.neuralNetwork(currentBandwidth));
    if (value) {
      for (const variant of sortedVariants) {
        const tests = Math.round(variant.bandwidth / 1000);
        console.log(sortedVariants[sortedVariants.length - 1]);

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
  /**
   * Enables automatic Variant choices from the last ones passed to setVariants.
   * After this, the AbrManager may call switchCallback() at any time.
   *
   * @exportDoc
   */
  enable() {
    this.enabled_ = true;
  }
  /**
   * Disables automatic Stream suggestions. After this, the AbrManager may not
   * call switchCallback().
   *
   * @exportDoc
   */
  disable() {
    this.enabled_ = false;
  }
  /**
   * Notifies the AbrManager that a segment has been downloaded (includes MP4
   * SIDX data, WebM Cues data, initialization segments, and media segments).
   *
   * @param {number} deltaTimeMs The duration, in milliseconds, that the request
   *     took to complete.
   * @param {number} numBytes The total number of bytes transferred.
   * @param {boolean} allowSwitch Indicate if the segment is allowed to switch
   *     to another stream.
   * @param {shaka.extern.Request=} request
   *     A reference to the request
   * @exportDoc
   */
  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch, request) {
    if (allowSwitch && this.lastTimeChosenMs_ != null && this.enabled_) {
      this.suggestStreams_();
    }
  }
  /**
   * Notifies the ABR that it is a time to suggest new streams. This is used by
   * the Player when it finishes adding the last partial segment of a fast
   * switching stream.
   *
   * @exportDoc
   */
  trySuggestStreams() {
    if (this.lastTimeChosenMs_ != null && this.enabled_) {
      this.suggestStreams_();
    }
  }
  suggestStreams_() {
    const chosenVariant = this.chooseVariant();

    if (chosenVariant) {
      this.switch_(
        chosenVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
  }
  /**
   * Gets an estimate of the current bandwidth in bit/sec.  This is used by the
   * Player to generate stats.dockclecl
   *
   * @return {number}
   * @exportDoc
   */
  getBandwidthEstimate() {}
  /**
   * Updates manager playback rate.
   *
   * @param {number} rate
   * @exportDoc
   */
  playbackRateChanged(rate) {
    this.playbackRate_ = rate;
  }

  /**
   * Set CMSD manager.
   *
   * @param {shaka.util.CmsdManager} cmsdManager
   * @exportDoc
   */
  setCmsdManager(cmsdManager) {}
  /**
   * Sets the ABR configuration.
   *
   * It is the responsibility of the AbrManager implementation to implement the
   * restrictions behavior described in shaka.extern.AbrConfiguration.
   *
   * @param {shaka.extern.AbrConfiguration} config
   * @exportDoc
   */
  configure(config) {
    this.config_ = config;
  }
}
