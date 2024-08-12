// import { DisplayStats } from "./DisplayStats";
// import { params } from "./data";

/**
 * Manages the buffering and quality switching for a media player.
 *
 * The `BufferManager` class is responsible for monitoring the media player's buffer
 * level and adjusting the video quality accordingly. It keeps track of the
 * available video variants, the current playback rate, and the buffer level.
 * It provides methods to enable/disable the buffer management, choose the
 * appropriate video variant based on the buffer level, and handle segment
 * downloads.
 */
export class BufferManager {
  constructor(getBufferFullnessCallback, player) {
    this.switchQualityCallback = null;
    this.mediaElement = null;
    this.enabled_ = false;
    this.player = player;
    this.videoVariants = [];
    this.getBufferFullness = getBufferFullnessCallback;
    this.downloadedSegments = [];
    this.failedSegments = [];
    this.playbackRate = 1;
    this.isStartupComplete = false;
    this.playbackRate_ = 1;
    this.monitorInterval = 1000;
    this.lastQualityChangeTime = null;
    this.config_ = null;
    this.cmsdManager = null;
    this.lastDownloadedSegments = null;
    this.highBufferThreshold = 0.8;
    this.lowBufferThreshold = 0.3;
    this.bufferPercentage = 10;
    this.currentQualityIndex = 0;
    this.bufferLevel = 0;

    this.startMonitoring();
    this.startMonitoringBuffer();
    this.setupErrorHandling();
  }

  init(switchQualityCallback) {
    this.switchQualityCallback = switchQualityCallback;
  }

  setMediaElement(mediaElement) {
    this.mediaElement = mediaElement;
  }

  stop() {
    this.switchQualityCallback = null;
    this.isEnabled = false;
    this.videoVariants = [];
    this.playbackRate = 1;
    this.lastQualityChangeTime = null;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.cmsdManager = null;
  }

  release() {}

  setVariants(variants) {
    this.videoVariants = variants;
  }

  chooseVariant(preferFastSwitching) {
    const bufferLevel = this.bufferLevel;

    if (bufferLevel < this.lowBufferThreshold) {
      this.decreaseQuality();
    } else if (bufferLevel > this.highBufferThreshold) {
      this.increaseQuality();
    }

    return this.getVariantByQualityIndex(this.currentQualityIndex);
  }

  decreaseQuality() {
    if (this.currentQualityIndex > 0) {
      this.currentQualityIndex--;
      this.restrictions(
        this.getVariantByQualityIndex(this.currentQualityIndex).bandwidth
      );
    }
  }

  increaseQuality() {
    const maxQualityIndex = this.videoVariants.length - 1;

    if (this.currentQualityIndex < maxQualityIndex) {
      this.currentQualityIndex++;
      this.restrictions(
        this.getVariantByQualityIndex(this.currentQualityIndex).bandwidth
      );
    }
  }

  enable() {
    this.enabled_ = true;
  }

  disable() {
    this.enabled_ = false;
  }

  startMonitoringBuffer() {
    const bufferFullness = this.getBufferFullness().toFixed(1);
    this.bufferLevel = bufferFullness;

    const chosenVariant = this.chooseVariant();

    if (chosenVariant) {
      this.switchQualityCallback(
        chosenVariant,
        this.config_.safeMarginSwitch,
        this.config_.clearBufferSwitch
      );
    }
  }

  restrictions(bandwidth) {
    this.config_.restrictions.maxBandwidth = bandwidth;
  }

  getDownloadedSegments() {
    return this.downloadedSegments;
  }

  getVariantByQualityIndex(qualityIndex) {
    const sortedVariants = this.videoVariants.sort(
      (a, b) => a.bandwidth - b.bandwidth
    );
    return sortedVariants[qualityIndex];
  }
  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch, request) {
    // const timeToFirstByte = request?.timeToFirstByte || 0;
    // const requestStartTime = request?.requestStartTime || Date.now();

    // const liveLatency = deltaTimeMs + timeToFirstByte;
    // const segmentDelay = Date.now() - requestStartTime + timeToFirstByte;
    // const segmentData = {
    //   contentType: request.contentType,
    //   timestamp: Date.now(),
    //   latency: liveLatency,
    //   delay: segmentDelay,
    // };

    // this.downloadedSegments.push(segmentData);

    if (allowSwitch) {
      this.startMonitoringBuffer();
    }

    // Logging untuk memantau nilai yang dihitung
  }

  /**
   * Starts monitoring the buffer and updates the display with relevant statistics.
   * This function is called at a regular interval specified by `this.monitorInterval`.
   * It filters the `this.downloadedSegments` array to get the segments downloaded in the last 5 seconds,
   * and then calculates and displays various statistics such as the number of recently downloaded segments,
   * the average live latency, and the segment delay.
   */
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
      // const jitter = document.getElementById("Jitter");
      // jitter.textContent = this.calculateJitter();
    }, this.monitorInterval);
  }

  calculateJitter() {
    // Mengambil 10 segmen terakhir untuk perhitungan
    const recentSegments = this.downloadedSegments.slice(-10);
    const delays = recentSegments.map((segment) => segment.delay);

    if (delays.length < 2) {
      return 0;
    }

    let jitterSum = 0;
    for (let i = 1; i < delays.length; i++) {
      jitterSum += Math.abs(delays[i] - delays[i - 1]);
    }

    const jitter = jitterSum / (delays.length - 1);

    // Logging untuk memantau nilai yang dihitung

    return Math.round(jitter * 1000) / 1000; // Mengembalikan jitter dalam milidetik
  }

  setupErrorHandling() {
    this.player
      .getNetworkingEngine()
      .registerResponseFilter((type, response) => {
        if (response.status >= 400) {
          const failedSegment = {
            uri: response.uri,
            timestamp: Date.now(),
            status: response.status,
          };
          this.failedSegments.push(failedSegment);
          console.error(
            `Failed to download segment: ${response.uri}, Status: ${response.status}`
          );
        }
      });
  }

  getFailedSegments() {
    return this.failedSegments;
  }
  calculateDelay() {
    const recentSegments = this.downloadedSegments.slice(-20); // Mengambil 20 segmen terakhir

    if (recentSegments.length === 0) return 0; // Jika tidak ada segmen, kembalikan 0

    const totalDelay = recentSegments.reduce(
      (acc, segment) => acc + segment.delay,
      0
    );
    const averageDelay = totalDelay / recentSegments.length; // Menghitung rata-rata delay

    return averageDelay; // Mengembalikan rata-rata delay
  }
  getLatencyStatistics() {
    const segmentCount = this.downloadedSegments.length;

    if (segmentCount === 0) {
      return null;
    }

    const recentSegments = this.downloadedSegments.slice(-10);
    const latencies = recentSegments.map((segment) => segment.latency);

    const sum = latencies.reduce((a, b) => a + b, 0);
    const averageLatency = sum / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);

    // Logging untuk memantau nilai yang dihitung
    // console.log("Recent Segments:", recentSegments);
    // console.log("Latencies:", latencies);
    // console.log("Average Latency:", averageLatency);
    // console.log("Max Latency:", maxLatency);
    // console.log("Min Latency:", minLatency);

    return {
      averageLatency,
      maxLatency,
      minLatency,
    };
  }

  addSegment(type, time) {
    this.downloadedSegments.push({ type, time });
  }

  getBandwidthEstimate() {}

  playbackRateChanged(rate) {
    this.playbackRate_ = rate;
  }

  setCmsdManager(cmsdManager) {
    this.cmsdManager_ = cmsdManager;
  }

  configure(config) {
    this.config_ = config;
  }
}
