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
      shaka.net.NetworkingEngine.registerScheme("ndn", NdnPlugin);
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
    case "rtt":
      element.textContent = formatInt(sRtt);
      break;
    case "rto":
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
  const { rtte } = NdnPlugin.getInternals();
  if (stats) {
    updateStats(stats, rtte, add);
  }
};
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
  const { sRtt, rto } = rtte;
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
    manifestTimeSeconds: formatInt(stats["manifestTimeSeconds"]),
    corruptedFrames: formatInt(stats["corruptedFrames"]),
    rtt: formatInt(sRtt),
    rto: formatInt(rto),
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
