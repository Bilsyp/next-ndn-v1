// --- File: app/stream/video-player/index.js ---
import { Abr_Test } from "@/app/stream/abr/abr_test";
import { parameter } from "@/lib/parameter";
import { formatInt } from "@/lib/utils";

export const checkBrowserSupport = (shaka, NdnPlugin, setPlayer) => {
  async function initPlayer() {
    const video = document.getElementById("video");
    const playerInstance = new shaka.Player();
    await playerInstance.attach(video);
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

export const handleLoadVideo = async (player, clear, content) => {
  clear();
  try {
    await player?.load(`ndn:/itb/video/${content}/playlist.mpd`);
  } catch (error) {
    console.log(error);
  }
};

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
  const { rtte } = NdnPlugin.getInternals();

  if (stats && track) {
    const concatTrack = {
      ...stats,
      track: track.filter((item) => item.active == true),
    };
    updateStats(concatTrack, rtte, add);
  }
};

export function calculateQoE(stats) {
  const {
    loadLatency,
    streamBandwidth,
    bufferingTime,
    decodedFrames,
    droppedFrames,
  } = stats;

  const latencyWeight = 0.8;
  const bandwidthWeight = 0.2;
  const bufferingWeight = 0.5;
  const frameWeight = 0.3;

  const latencyScore = Math.max(0, Math.min(1, 1 - loadLatency / 1000));
  const bandwidthScore = Math.max(0, Math.min(1, streamBandwidth / 1000000));
  const bufferingScore = Math.max(0, Math.min(1, 1 - bufferingTime / 10));
  const frameScore = Math.max(
    0,
    Math.min(1, decodedFrames / (decodedFrames + droppedFrames))
  );

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
    sRtt_,
    rto_,
  });
};
