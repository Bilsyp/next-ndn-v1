import { Abr_Test } from "@/app/stream/abr/abr_test";
import { Testing } from "@/app/stream/abr/test";
import { parameter } from "@/lib/parameter";
/**
 * Checks if the browser supports the required functionality for the video player and initializes the player if supported.
 *
 * @param {object} shaka - The Shaka player library.
 * @param {function} NdnPlugin - The NDN plugin for the Shaka player.
 * @param {function} setPlayer - A function to set the initialized player instance.
 * @returns {void}
 */
export const checkBrowserSupport = (shaka, NdnPlugin, setPlayer) => {
  async function initPlayer() {
    const video = document.getElementById("video");
    const playerInstance = new shaka.Player();
    await playerInstance.attach(video);
    // const ui = new shaka.ui.Overlay(playerInstance, videoContainer, video);
    // ui.configure(uiConfig);
    setPlayer(playerInstance);
    playerInstance.configure(
      "abrFactory",
      () => new Abr_Test(() => playerInstance?.getBufferFullness())
    );
  }
  shaka.polyfill.installAll();
  if (shaka.Player.isBrowserSupported()) {
    if (shaka.net.HttpFetchPlugin.isSupported()) {
      shaka.net.NetworkingEngine.registerScheme(
        "http",
        shaka.net.HttpFetchPlugin.parse,
        shaka.net.NetworkingEngine.PluginPriority.PREFERRED,
        true
      );
      shaka.net.NetworkingEngine.registerScheme(
        "ndn",
        NdnPlugin,
        shaka.net.NetworkingEngine.PluginPriority.PREFERRED,
        true
      );
      initPlayer();
    }
  } else {
    console.error("Browser not supported!");
  }
};

/**
 * Loads a video from the specified content path and attaches it to the player.
 *
 * @param {object} player - The Shaka player instance.
 * @param {function} clear - A function to clear any existing player content.
 * @param {string} content - The path to the video content to load.
 * @returns {Promise<void>} - A Promise that resolves when the video has been loaded.
 */
export const handleLoadVideo = async (player, clear, content) => {
  clear();
  ``;
  try {
    await player?.load(`ndn:/itb/video/${content}/playlist.mpd`);
    // await player.load(
    //   `http://localhost:4000/stream/video/${content}/playlist.mpd`
    // );
    // await player?.load(`ndn:/itb/video/minutes/playlist.mpd`);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Displays a specific statistic from the player's stats object on the corresponding HTML element.
 *
 * @param {HTMLElement} element - The HTML element to display the statistic on.
 * @param {object} stats - The player's stats object.
 * @param {object} rtte - The round-trip time estimation object.
 * @returns {void}
 */
export const displayStat = (element, stats, rtte) => {
  const { sRtt, rto } = rtte;

  switch (element.id) {
    case "LastBitrate":
      // element.textContent = formatInt(stats["track"][0].bandwidth / 1000);
      break;

    case "loadLatency":
      element.textContent = formatInt(stats["loadLatency"] * 1000);
      break;
    case "estimatedBandwidth":
      element.textContent = formatInt(stats["estimatedBandwidth"] / 1024);
      break;
    case "streamBandwidth":
      element.textContent = formatInt(stats["streamBandwidth"] / 1024);
      break;
    case "width":
      element.textContent = formatInt(stats["width"]);
      break;
    case "height":
      element.textContent = formatInt(stats["height"]);
      break;
    case "decodedFrames":
      element.textContent = formatInt(stats["decodedFrames"]);
      break;
    case "droppedFrames":
      element.textContent = formatInt(stats["droppedFrames"]);
      break;
    case "bufferingTime":
      element.textContent = formatInt(stats["bufferingTime"]);
      break;
    case "playTime":
      element.textContent = formatInt(stats["playTime"]);
      break;
    case "pauseTime":
      element.textContent = formatInt(stats["pauseTime"]);
      break;
    case "sRtt_":
      element.textContent = formatInt(sRtt);
      break;
    case "rto_":
      element.textContent = formatInt(rto);
      break;
    case "corruptedFrames":
      element.textContent = formatInt(stats["corruptedFrames"]);
      break;
    case "manifestTimeSeconds":
      element.textContent = stats["manifestTimeSeconds"];
      break;
    default:
      console.warn("Unknown stat type:", element.id);
  }
};
export const handleTimeUpdate = (player, NdnPlugin, add) => {
  const stats = player?.getStats();
  const track = player?.getVariantTracks();
  // const segment = player?.getSegmentData();
  // console.log(segment);
  const { rtte } = NdnPlugin.getInternals();
  // const concatTrack = { ...stats, track: track.map((item) => item.active) };
  if (stats && track) {
    const concatTrack = {
      ...stats,
      track: track.filter((item) => item.active == true),
    };
    updateStats(concatTrack, rtte, add);
  }
};
/**
 * Calculates the Quality of Experience (QoE) score based on various video playback metrics.
 *
 * The QoE score is calculated as a weighted average of the following metrics:
 * - Load Latency: The time it takes to load the video, normalized to a 0-1 range.
 * - Stream Bandwidth: The available stream bandwidth, normalized to a 0-1 range.
 * - Buffering Time: The time spent buffering, normalized to a 0-1 range.
 * - Frame Quality: The ratio of decoded frames to the sum of decoded and dropped frames.
 *
 * The weights for each metric can be adjusted to prioritize certain aspects of the video playback experience.
 *
 * @param {Object} stats - An object containing the video playback metrics.
 * @param {number} stats.loadLatency - The time it takes to load the video, in milliseconds.
 * @param {number} stats.streamBandwidth - The available stream bandwidth, in bits per second.
 * @param {number} stats.bufferingTime - The time spent buffering, in seconds.
 * @param {number} stats.decodedFrames - The number of frames that were successfully decoded.
 * @param {number} stats.droppedFrames - The number of frames that were dropped.
 * @returns {number} The calculated QoE score, ranging from 0 to 1.
 */

export function calculateQoE(stats) {
  const {
    loadLatency,
    streamBandwidth,
    bufferingTime,
    decodedFrames,
    droppedFrames,
  } = stats;

  // Define weights for each parameter
  const latencyWeight = 0.8;
  const bandwidthWeight = 0.2;
  const bufferingWeight = 0.5;
  const frameWeight = 0.3;

  // Calculate QoE scores for each parameter
  const latencyScore = Math.max(0, Math.min(1, 1 - loadLatency / 1000)); // normalize to 0-1 range
  const bandwidthScore = Math.max(0, Math.min(1, streamBandwidth / 1000000)); // normalize to 0-1 range
  const bufferingScore = Math.max(0, Math.min(1, 1 - bufferingTime / 10)); // normalize to 0-1 range
  const frameScore = Math.max(
    0,
    Math.min(1, decodedFrames / (decodedFrames + droppedFrames))
  ); // ratio of decoded frames to total frames

  // Calculate overall QoE score
  const qoeScore =
    latencyWeight * latencyScore +
    bandwidthWeight * bandwidthScore +
    bufferingWeight * bufferingScore +
    frameWeight * frameScore;

  return qoeScore;
}

const updateStats = (stats, rtte, add) => {
  parameter.forEach((item) => {
    const element = document.querySelector(`#${item.content}`);
    if (element) {
      displayStat(element, stats, rtte);
      addToQueue(stats, rtte, add);
    }
  });
};
const addToQueue = (stats, rtte, add) => {
  const { sRtt_, rto_ } = rtte;
  add({
    width: stats["width"],
    height: stats["height"],
    loadLatency: formatInt(stats["loadLatency"] * 1000),
    streamBandwidth: formatInt(stats["streamBandwidth"] / 1024),
    estimatedBandwidth: formatInt(stats["estimatedBandwidth"] / 1024),
    decodedFrames: formatInt(stats["decodedFrames"]),
    droppedFrames: formatInt(stats["droppedFrames"]),
    bufferingTime: stats["bufferingTime"],
    playTime: formatInt(stats["playTime"]),
    pauseTime: formatInt(stats["pauseTime"]),
    // lastBitrate: formatInt(stats["track"][0].bandwidth / 1000),
    sRtt_,
    rto_,
  });
};

export function calculateDuration(duration) {
  const bufferPercentage = 10;
  const bufferingGoal = (duration * bufferPercentage) / 100;
  return Math.round(bufferingGoal * 100) / 100; // Membulatkan ke dua desimal
}
function formatInt(n) {
  return Number.isNaN(n) ? "?" : `${Math.round(n)}`;
}
export function filterDuplicates(array, keys) {
  const seen = new Set();

  const filteredArray = array.filter((item) => {
    // Membuat string unik berdasarkan kombinasi nilai properti yang diberikan
    const keyValues = keys.map((key) => item[key]).join("|");
    if (seen.has(keyValues)) {
      return false;
    } else {
      seen.add(keyValues);
      return true;
    }
  });

  return filteredArray;
}
