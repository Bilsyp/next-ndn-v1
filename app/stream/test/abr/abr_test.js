export class Abr_Test {
  constructor(getBufferFullness) {
    this.variants_ = [];
    this.enabled_ = false;
    this.switch_ = null;
    this.config_ = null;
    this.mediaElement_ = null;
    this.lastTimeChosenMs_ = null;
    this.getBufferFullness_ = getBufferFullness;
    this.lastDownloadSpeed_ = null;
    this.requestCompleted = [];
    this.Startmonitoring = this.monitoring();
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
  monitoring() {
    function calculateAverage(array) {
      // Convert the array of string numbers to an array of floats
      const averageDownload = array.map((item) =>
        Number(item.downloadTimeSeconds)
      );

      // Limit the array to the first 100 items
      const limitedArray = averageDownload.slice(0, 5);

      // Calculate the sum of the limited array
      const sum = limitedArray.reduce((acc, num) => acc + num, 0);

      // Calculate the average
      const average = sum / limitedArray.length;

      return average;
    }
    const interval = setInterval(() => {
      const averageSegmentDownload = calculateAverage(this.requestCompleted);
      console.log(this.requestCompleted);
      console.log(
        `average download in the last 5 segments: ${averageSegmentDownload.toFixed(2)}`
      );
    }, 2000);
  }

  getBandwidthEstimate() {
    // If we're not estimating bandwidth...ffd
    return 0;
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
  chooseVariant() {
    let choosen = 20;
    if(choosen){
        
    }
    const last_Bitrate_Selected = this.variants_[1].bandwidth;
    return this.variants_;
  }
  // deltaTimes : The duration, in milliseconds, that the request took to complete
  // numbytes :   The total number of bytes transferred.

  segmentDownloaded(deltaTimeMs, numBytes, allowSwitch) {
    const buffer = this.getBufferFullness_();
    // Convert time to seconds and round to two decimal places
    const downloadTimeSeconds = (deltaTimeMs / 1000).toFixed(2);
    const chooseVariant = this.chooseVariant();

    if (chooseVariant && allowSwitch) {
      const segment = {
        numBytes: numBytes,
        downloadTimeSeconds: downloadTimeSeconds,
        bufferSize: buffer,
        lastBitrate: chooseVariant.bandwidth,
      };
      // Check and manage the list of completed requests
      if (this.requestCompleted.length >= 5) {
        this.requestCompleted = []; // Clear the list if it exceeds 100 entries
      }

      // Add the segment object to the list
      this.requestCompleted.push(segment);
    }
    // Create a segment object with numBytes and downloadTimeSeconds

    // Log that a segment has been successfully downloaded
    // console.log(
    //   `Segment of ${numBytes} bytes downloaded in ${downloadTimeSeconds} seconds.`
    // );
  }
}
