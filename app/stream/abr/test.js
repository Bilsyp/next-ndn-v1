import shaka from "shaka-player";

shaka.abr.Ewma = class {
  /**
   * @param {number} halfLife The quantity of prior samples (by weight) used
   *   when creating a new estimate.  Those prior samples make up half of the
   *   new estimate.
   */
  constructor(halfLife) {
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
export class Testing {
  /** */
  constructor() {
    /** @private {?shaka.extern.AbrManager.SwitchCallback} */
    this.switch_ = null;

    /** @private {boolean} */
    this.enabled_ = false;

    /** @private {shaka.abr.EwmaBandwidthEstimator} */
    this.bandwidthEstimator_ = new shaka.abr.EwmaBandwidthEstimator();

    /** @private {!shaka.util.EventManager} */
    this.eventManager_ = new shaka.util.EventManager();

    // Some browsers implement the Network Information API, which allows
    // retrieving information about a user's network connection. We listen
    // to the change event to be able to make quick changes in case the type
    // of connectivity changes.
    if (navigator.connection && navigator.connection.addEventListener) {
      this.eventManager_.listen(
        /** @type {EventTarget} */ (navigator.connection),
        "change",
        () => {
          if (this.enabled_ && this.config_.useNetworkInformation) {
            this.bandwidthEstimator_ = new shaka.abr.EwmaBandwidthEstimator();
            if (this.config_) {
              this.bandwidthEstimator_.configure(this.config_.advanced);
            }
            const chosenVariant = this.chooseVariant();
            if (chosenVariant && navigator.onLine) {
              this.switch_(
                chosenVariant,
                this.config_.clearBufferSwitch,
                this.config_.safeMarginSwitch
              );
            }
          }
        }
      );
    }

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

    /** @private {HTMLMediaElement} */
    this.mediaElement_ = null;

    /** @private {ResizeObserver} */
    this.resizeObserver_ = null;

    /** @private {shaka.util.Timer} */
    this.resizeObserverTimer_ = new shaka.util.Timer(() => {
      if (this.config_.restrictToElementSize) {
        const chosenVariant = this.chooseVariant();
        if (chosenVariant) {
          this.switch_(
            chosenVariant,
            this.config_.clearBufferSwitch,
            this.config_.safeMarginSwitch
          );
        }
      }
    });

    /** @private {?shaka.util.CmsdManager} */
    this.cmsdManager_ = null;
  }

  /**
   * @override
   * @export
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

    // Don't reset |startupComplete_|: if we've left the startup interval, we
    // can start using bandwidth estimates right away after init() is called.
  }

  /**
   * @override
   * @export
   */
  release() {
    // stop() should already have been called for unload
    this.eventManager_.release();
    this.resizeObserverTimer_ = null;
  }

  /**
   * @override
   * @export
   */
  init(switchCallback) {
    this.switch_ = switchCallback;
  }

  /**
   * @param {boolean=} preferFastSwitching
   * @return {shaka.extern.Variant}
   * @override
   * @export
   */
  chooseVariant(preferFastSwitching = false) {
    let maxHeight = Infinity;
    let maxWidth = Infinity;

    if (this.config_.restrictToScreenSize) {
      const devicePixelRatio = this.config_.ignoreDevicePixelRatio
        ? 1
        : window.devicePixelRatio;
      maxHeight = window.screen.height * devicePixelRatio;
      maxWidth = window.screen.width * devicePixelRatio;
    }

    if (this.resizeObserver_ && this.config_.restrictToElementSize) {
      const devicePixelRatio = this.config_.ignoreDevicePixelRatio
        ? 1
        : window.devicePixelRatio;
      maxHeight = Math.min(
        maxHeight,
        this.mediaElement_.clientHeight * devicePixelRatio
      );
      maxWidth = Math.min(
        maxWidth,
        this.mediaElement_.clientWidth * devicePixelRatio
      );
    }

    let normalVariants = this.variants_.filter((variant) => {
      return !shaka.util.StreamUtils.isFastSwitching(variant);
    });
    if (!normalVariants.length) {
      normalVariants = this.variants_;
    }

    let variants = normalVariants;
    if (preferFastSwitching && normalVariants.length != this.variants_.length) {
      variants = this.variants_.filter((variant) => {
        return shaka.util.StreamUtils.isFastSwitching(variant);
      });
    }

    // Get sorted Variants.
    let sortedVariants = this.filterAndSortVariants_(
      this.config_.restrictions,
      variants,
      /* maxHeight= */ Infinity,
      /* maxWidth= */ Infinity
    );

    if (maxHeight != Infinity || maxWidth != Infinity) {
      const resolutions = this.getResolutionList_(sortedVariants);
      for (const resolution of resolutions) {
        if (resolution.height >= maxHeight && resolution.width >= maxWidth) {
          maxHeight = resolution.height;
          maxWidth = resolution.width;
          break;
        }
      }

      sortedVariants = this.filterAndSortVariants_(
        this.config_.restrictions,
        variants,
        maxHeight,
        maxWidth
      );
    }

    const currentBandwidth = this.getBandwidthEstimate();

    if (variants.length && !sortedVariants.length) {
      // If we couldn't meet the ABR restrictions, we should still play
      // something.
      // These restrictions are not "hard" restrictions in the way that
      // top-level or DRM-based restrictions are.  Sort the variants without
      // restrictions and keep just the first (lowest-bandwidth) one.
      sortedVariants = this.filterAndSortVariants_(
        /* restrictions= */ null,
        variants,
        /* maxHeight= */ Infinity,
        /* maxWidth= */ Infinity
      );
      sortedVariants = [sortedVariants[0]];
    }

    // Start by assuming that we will use the first Stream.
    let chosen = sortedVariants[0] || null;

    for (let i = 0; i < sortedVariants.length; i++) {
      const item = sortedVariants[i];
      const playbackRate = !isNaN(this.playbackRate_)
        ? Math.abs(this.playbackRate_)
        : 1;
      const itemBandwidth = playbackRate * item.bandwidth;
      const minBandwidth =
        itemBandwidth / this.config_.bandwidthDowngradeTarget;
      let next = { bandwidth: Infinity };
      for (let j = i + 1; j < sortedVariants.length; j++) {
        if (item.bandwidth != sortedVariants[j].bandwidth) {
          next = sortedVariants[j];
          break;
        }
      }
      const nextBandwidth = playbackRate * next.bandwidth;
      const maxBandwidth = nextBandwidth / this.config_.bandwidthUpgradeTarget;

      if (
        currentBandwidth >= minBandwidth &&
        currentBandwidth <= maxBandwidth &&
        chosen.bandwidth != item.bandwidth
      ) {
        chosen = item;
      }
    }

    this.lastTimeChosenMs_ = Date.now();
    return chosen;
  }

  /**
   * @override
   * @export
   */
  enable() {
    this.enabled_ = true;
  }

  /**
   * @override
   * @export
   */
  disable() {
    this.enabled_ = false;
  }

  /**
   * @param {number} deltaTimeMs The duration, in milliseconds, that the request
   *     took to complete.
   * @param {number} numBytes The total number of bytes transferred.
   * @param {boolean} allowSwitch Indicate if the segment is allowed to switch
   *     to another stream.
   * @param {shaka.extern.Request=} request
   *     A reference to the request
   * @override
   * @export
   */
  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch, request) {
    this.bandwidthEstimator_.sample(deltaTimeMs, numBytes);

    if (allowSwitch && this.lastTimeChosenMs_ != null && this.enabled_) {
      this.suggestStreams_();
    }
  }

  /**
   * @override
   * @export
   */
  trySuggestStreams() {
    if (this.lastTimeChosenMs_ != null && this.enabled_) {
      this.suggestStreams_();
    }
  }

  /**
   * @override
   * @export
   */
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

  /**
   * @override
   * @export
   */
  setVariants(variants) {
    this.variants_ = variants;
  }

  /**
   * @override
   * @export
   */
  playbackRateChanged(rate) {
    this.playbackRate_ = rate;
  }

  /**
   * @override
   * @export
   */
  setMediaElement(mediaElement) {
    this.mediaElement_ = mediaElement;
    if (this.resizeObserver_) {
      this.resizeObserver_.disconnect();
      this.resizeObserver_ = null;
    }
    if (this.mediaElement_ && "ResizeObserver" in window) {
      this.resizeObserver_ = new ResizeObserver(() => {
        const SimpleAbrManager = shaka.abr.SimpleAbrManager;
        // Batch up resize changes before checking them.
        this.resizeObserverTimer_.tickAfter(
          /* seconds= */ SimpleAbrManager.RESIZE_OBSERVER_BATCH_TIME
        );
      });
      this.resizeObserver_.observe(this.mediaElement_);
    }
  }

  /**
   * @override
   * @export
   */
  setCmsdManager(cmsdManager) {
    this.cmsdManager_ = cmsdManager;
  }

  /**
   * @override
   * @export
   */
  configure(config) {
    this.config_ = config;
    if (this.bandwidthEstimator_ && this.config_) {
      this.bandwidthEstimator_.configure(this.config_.advanced);
    }
  }

  /**
   * Calls switch_() with the variant chosen by chooseVariant().
   *
   * @private
   */
  suggestStreams_() {
    if (!this.startupComplete_) {
      // Check if we've got enough data yet.
      if (!this.bandwidthEstimator_.hasGoodEstimate()) {
        return;
      }
      this.startupComplete_ = true;
    } else {
      // Check if we've left the switch interval.
      const now = Date.now();
      const delta = now - this.lastTimeChosenMs_;
      if (delta < this.config_.switchInterval * 1000) {
        return;
      }
    }

    const chosenVariant = this.chooseVariant();
    const bandwidthEstimate = this.getBandwidthEstimate();
    const currentBandwidthKbps = Math.round(bandwidthEstimate / 1000.0);

    if (chosenVariant) {
      // If any of these chosen streams are already chosen, Player will filter
      // them out before passing the choices on to StreamingEngine.
      this.switch_(
        chosenVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
  }

  /**
   * @private
   */
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

  /**
   * @param {?shaka.extern.Restrictions} restrictions
   * @param {!Array.<shaka.extern.Variant>} variants
   * @param {!number} maxHeight
   * @param {!number} maxWidth
   * @return {!Array.<shaka.extern.Variant>} variants filtered according to
   *   |restrictions| and sorted in ascending order of bandwidth.
   * @private
   */
  filterAndSortVariants_(restrictions, variants, maxHeight, maxWidth) {
    if (this.cmsdManager_) {
      const maxBitrate = this.cmsdManager_.getMaxBitrate();
      if (maxBitrate) {
        variants = variants.filter((variant) => {
          if (!variant.bandwidth || !maxBitrate) {
            return true;
          }
          return variant.bandwidth <= maxBitrate;
        });
      }
    }

    if (restrictions) {
      variants = variants.filter((variant) => {
        return shaka.util.StreamUtils.meetsRestrictions(
          variant,
          restrictions,
          /* maxHwRes= */ { width: maxWidth, height: maxHeight }
        );
      });
    }

    return variants.sort((v1, v2) => {
      return v1.bandwidth - v2.bandwidth;
    });
  }

  /**
   * @param {!Array.<shaka.extern.Variant>} variants
   * @return {!Array.<{height: number, width: number}>}
   * @private
   */
  getResolutionList_(variants) {
    const resolutions = [];
    for (const variant of variants) {
      const video = variant.video;
      if (!video || !video.height || !video.width) {
        continue;
      }
      resolutions.push({
        height: video.height,
        width: video.width,
      });
    }

    return resolutions.sort((v1, v2) => {
      return v1.width - v2.width;
    });
  }
}
