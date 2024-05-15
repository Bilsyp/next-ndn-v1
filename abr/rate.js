export class Rate {
  constructor() {
    this.variants_ = [];
    this.enabled_ = false;
    this.switch_ = null;
    this.config_ = null;
    this.mediaElement_ = null;
    this.lastTimeChosenMs_ = null;
    this.lastDownloadSpeed_ = null;
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

  playbackRateChanged(rate) {}

  getBandwidthEstimate() {
    // If bandwidth estimation is not available, return 0
    return 0;
  }

  chooseVariant() {
    // If the last download speed is not available or not positive, return null
    let chosenVariant = null;
    const lastDownloadSpeedMbps = this.lastDownloadSpeed_;
    // If there is a last download speed available and positive, choose variant based on download speed
    if (lastDownloadSpeedMbps > 0) {
      // Filter variants that have bandwidth below or equal to the last download speed
      const filteredVariants = this.variants_.filter((variant) => {
        return variant.bandwidth <= lastDownloadSpeedMbps;
      });

      // If there are variants available based on download speed, choose variant with the highest bandwidth
      if (filteredVariants.length > 0) {
        chosenVariant = filteredVariants.reduce((prev, curr) => {
          return curr.bandwidth > prev.bandwidth ? curr : prev;
        });
      }
    }

    // If no variant is chosen based on download speed, choose variant with the highest bandwidth
    if (!chosenVariant) {
      chosenVariant = this.variants_.reduce((prev, curr) => {
        return curr.bandwidth > prev.bandwidth ? curr : prev;
      });
    }

    // Return the chosen variant
    return chosenVariant;
  }
  //  variant bandwidth yang akan dipilih berdasarkan downloadspeed
  // expect downloadSpeed sesuai dengan bandwidth variant sesuai kecepatan tidak terlalu besar dan tidak terlalu kecil
  // 1038405
  // 1280000
  // 657179 53248
  // 2462605
  //  563200
  //
  // 214016
  // 1521898
  // const downloadSpeedKbps = (numBytes * 8) / (deltaTimeMs * 1000);
  //  result  0.573855337623071

  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    // Calculate download speed from the last segment
    // deltaTimeMs : The duration, in milliseconds, that the request took to complete.
    //   numBytes : The total number of bytes transferred.
    const downloadSpeed = Math.ceil(numBytes / deltaTimeMs) * 1024 * 10;
    // Save the last download speed
    this.lastDownloadSpeed_ = downloadSpeed;
    // If necessary, perform a new variant selection
    const chosenVariant = this.chooseVariant();
    if (allowSwitch) {
      // If the chosen variant is different from the current one, switch to it
      this.switch_(
        chosenVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
  }
}
