export class Buffers {
  constructor(getBufferFullness) {
    this.variants_ = [];
    this.enabled_ = false;
    this.switch_ = null;
    this.config_ = null;
    this.mediaElement_ = null;
    this.lastTimeChosenMs_ = null;
    this.getBufferFullness_ = getBufferFullness;
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
    // If we're not estimating bandwidth...ffd
    return 0;
  }
  calculateBufferPercentage(bufferFilled) {
    const bufferPercentage = (bufferFilled / 1000) * 100; // Convert from milliseconds to seconds and then to percentage
    return bufferPercentage;
  }

  chooseVariant(bufferLevel) {
    // Sort variants by bandwidth
    const sortedVariants = this.variants_.sort(
      (a, b) => b.bandwidth - a.bandwidth
    );
    let chooseVariant = null | [];
    // Define the range for different buffer levels
    const lowBufferRange = 3; // Range for low buffer level
    const mediumBufferRange = 7; // Range for medium buffer level
    // Determine the variant based on buffer level
    if (bufferLevel <= lowBufferRange) {
      // Low buffer level, choose the lowest variant

      chooseVariant = sortedVariants[sortedVariants.length - 1];
    } else if (bufferLevel <= mediumBufferRange) {
      // Medium buffer level, choose the medium variant

      const mediumVariantIndex = Math.floor((sortedVariants.length - 1) / 2);
      chooseVariant = sortedVariants[mediumVariantIndex];
    } else {
      // High buffer level, choose the highest variant
      chooseVariant = sortedVariants[0];
    }
    return chooseVariant;
  }
  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    const buffer = this.getBufferFullness_();
    const bufferInteger = Math.round(buffer * 1000);
    const bufferPercentage = this.calculateBufferPercentage(bufferInteger);
    const bufferLevel = Math.ceil(bufferPercentage / 10); // Convert to a level between 1-10
    const chosenVariant = this.chooseVariant(bufferLevel);
    this.switch_(
      chosenVariant
      // this.config_.clearBufferSwitch,
      // this.config_.safeMarginSwitch
    );
    this.lastLevel = bufferLevel;
  }
}
