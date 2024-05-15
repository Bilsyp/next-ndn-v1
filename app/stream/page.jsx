"use client";
import shaka from "shaka-player";
import { Streaming } from "@/components/component/streaming";
import React, { useEffect, useState } from "react";
import { uiConfig } from "@/config/ui.config";
import { Button } from "@/components/ui/button";
import { useQueue } from "@uidotdev/usehooks";
import { Connection } from "@/components/component/connection";
import { NdnPlugin, formatInt } from "@/ndn/ndn-shaka-plugin";
import { parameter } from "@/lib/parameter";
import { usePapaParse } from "react-papaparse";
import SelectAbr from "@/components/component/selectabr";
import { Buffers } from "@/abr/buffer";
import { Rate } from "@/abr/rate";
import { Hybrid } from "@/abr/hybrid";
import Link from "next/link";
const Stream = () => {
  const [player, setPlayer] = useState(null);
  const [content, setContent] = useState("");
  const { clear, add, queue } = useQueue([]);
  const { jsonToCSV } = usePapaParse();
  const [config, setConfig] = useState("");

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
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

  const initPlayer = async () => {
    const video = document.getElementById("video");
    const videoContainer = document.getElementById("video-container");
    const playerInstance = new shaka.Player();
    await playerInstance.attach(video);
    // const ui = new shaka.ui.Overlay(playerInstance, videoContainer, video);
    // ui.configure(uiConfig);
    setPlayer(playerInstance);
  };
  const handleLoadVideo = async () => {
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
  const handleTimeUpdate = () => {
    const stats = player?.getStats();
    const { rtte } = NdnPlugin.getInternals();
    if (stats) {
      updateStats(stats, rtte);
    }
  };
  const updateStats = (stats, rtte) => {
    parameter.forEach((item) => {
      const element = document.querySelector(`#${item.content}`);
      if (element) {
        displayStat(element, stats, rtte);
        addToQueue(stats, rtte);
      }
    });
  };
  const displayStat = (element, stats, rtte) => {
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
  const addToQueue = (stats, rtte) => {
    const { sRtt, rto } = rtte;
    add({
      width: stats["width"],
      height: stats["height"],
      loadLatency: formatInt(stats["loadLatency"] * 1000),
      streamBandwidth: formatInt(stats["streamBandwidth"] / 1024),
      estimatedBandwidth: formatInt(stats["estimatedBandwidth"] / 1024),
      decodedFrames: formatInt(stats["decodedFrames"]),
      droppedFrames: formatInt(stats["droppedFrames"]),
      bufferingTime: formatInt(stats["bufferingTime"]),
      playTime: formatInt(stats["playTime"]),
      pauseTime: formatInt(stats["pauseTime"]),
      manifestTimeSeconds: formatInt(stats["manifestTimeSeconds"]),
      corruptedFrames: formatInt(stats["corruptedFrames"]),
      rtt: formatInt(sRtt),
      rto: formatInt(rto),
    });
  };
  const handleRecord = () => {
    const obj = JSON.stringify(queue);
    const csv = jsonToCSV(obj);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, `${config}.csv`);
  };
  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleSetConfig = async () => {
    clear();
    switch (config) {
      case "Rate Base":
        player.configure("abrFactory", () => new Rate());
        player.configure({
          streaming: {
            bufferBehind: 30,
            bufferingGoal: 40,
          },
        });
        break;
      case "Buffer Base":
        player.configure(
          "abrFactory",
          () => new Buffers(() => player?.getBufferFullness())
        );
        player.configure({
          streaming: {
            bufferBehind: 5,
            bufferingGoal: 120,
          },
        });
        break;
      case "Hybrid Base":
        player.configure(
          "abrFactory",
          () => new Hybrid(() => player?.getBufferFullness())
        );
        player.configure({
          streaming: {
            bufferBehind: 30,
            bufferingGoal: 20,
          },
        });
        break;
      case "Throughput Base":
        player.configure("abrFactory", () => new shaka.abr.SimpleAbrManager());
        // player.resetConfiguration();

        break;
    }
  };
  useEffect(() => {
    handleLoadVideo();
  }, [content]);
  useEffect(() => {
    handleSetConfig();
  }, [config]);
  return (
    <div>
      <Connection />

      <Streaming setContent={setContent}>
        <div
          data-shaka-player-container
          id="video-container"
          className="w-full border-2 rounded-md border-gray-500"
          data-shaka-player-cast-receiver-id="07AEE832"
        >
          <video
            data-shaka-player
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            id="video"
            poster="/wal.jpg"
            controls
            className="w-full"
          />
        </div>
        <div className="interactive_buttons mt-2 flex gap-3 items-center">
          <Button onClick={handleRecord}>Record Data</Button>
          <SelectAbr setconfig={setConfig} />
        </div>
      </Streaming>
    </div>
  );
};

export default Stream;
