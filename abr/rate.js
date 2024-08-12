export class Rate {
  constructor() {
    this.variants_ = [];
    this.enabled_ = false;
    this.switch_ = null;
    this.config_ = null;
    this.mediaElement_ = null;
    this.lastTimeChosenMs_ = null;
    this.lastDownloadSpeed_ = null;
    this.downloadedSegments = [];
    this.monitoring();
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

  monitoring() {}

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

  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    const deltaSec = deltaTimeMs / 1000; // Konversi dari milidetik ke detik
    const throughputBps = (numBytes * 8) / deltaSec; // Throughput dalam bit per detik
    const throughputKbps = throughputBps / 1024; // Throughput dalam kilobit per detik
    const chosenVariant = this.chooseVariant();
    if (allowSwitch) {
      this.switch_(
        chosenVariant,
        this.config_.clearBufferSwitch,
        this.config_.safeMarginSwitch
      );
    }
    this.lastDownloadSpeed_ = throughputKbps;
  }
  startMonitoring() {
    return setInterval(() => {
      const currentTime = Date.now();
      const recentSegments = this.downloadedSegments.filter(
        (segment) => currentTime - segment.timestamp <= 5000
      );
      this.lastDownloadedSegmentsCount = recentSegments.length;
      //   const stats = this.player.getStats();
      //   const display = new DisplayStats();
      //   params.forEach((item) => {
      //     const value = {
      //       ...stats,
      //       lastDownloadedSegmentsCount: this.lastDownloadedSegmentsCount,
      //       liveLatency: this.getLatencyStatistics().averageLatency.toFixed(2),
      //       segmentdelay: this.calculateDelay(),
      //       jitter: this.calculateJitter(),
      //     };
      //     display.displayStatValue(item, value);
      //   });
    }, this.monitorInterval);
  }
}
