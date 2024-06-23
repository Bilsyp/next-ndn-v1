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
    let chosenVariant = null;
    const lastDownloadSpeedMbps = this.lastDownloadSpeed_;
    const sortedVariants = this.variants_.sort(
      (a, b) => b.bandwidth - a.bandwidth
    );

    if (lastDownloadSpeedMbps > 0) {
      for (const variant of sortedVariants) {
        const variantBandwidthMbps = Math.round(variant.bandwidth / 1000); // Konversi ke Mbps
        if (
          variantBandwidthMbps < lastDownloadSpeedMbps ||
          variantBandwidthMbps == lastDownloadSpeedMbps
        ) {
          console.log("sip");
          chosenVariant = variant;
          break;
        }
      }
    }

    if (!chosenVariant) {
      chosenVariant = sortedVariants[sortedVariants.length - 1]; // Pilih varian dengan bandwidth tertinggi
    }

    return chosenVariant;
  }

  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    const throughputBps = (numBytes * 8) / (deltaTimeMs / 1000);
    const throughputMbps = Math.round(throughputBps / (1024 * 1024));
    this.lastDownloadSpeed_ = throughputMbps * 1024;
    const chosenVariant = this.chooseVariant();
    if (allowSwitch) {
      this.switch_(
        chosenVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
  }
}
