// --- File: pages/StreamPage.jsx ---
"use client";
import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";
import { useQueue } from "@uidotdev/usehooks";
import { usePapaParse } from "react-papaparse";

import { Streaming } from "@/components/component/stream/streaming";
import { Button } from "@/components/ui/button";
import { RouterConnection } from "@/components/component/stream/RouterConnection";
import SelectAbr from "@/components/component/stream/selectabr";

import { NdnPlugin } from "@/ndn/ndn-plugin";
import { Rate } from "@/abr/rate";
import { Hybrid } from "@/abr/hybrid";
import { Neural } from "@/abr/neural";
import { BufferManager } from "@/abr/bufferv2";

import { calculateDuration } from "@/utils";
import {
  checkBrowserSupport,
  handleTimeUpdate,
  handleLoadVideo,
} from "@/app/stream/video-player";

const StreamPage = () => {
  const [player, setPlayer] = useState(null);
  const [content, setContent] = useState("");
  const { clear, add, queue } = useQueue([]);
  const { jsonToCSV } = usePapaParse();
  const [config, setConfig] = useState("shaka");
  const [net, setNet] = useState();
  const video = useRef(null);

  useEffect(() => {
    checkBrowserSupport(shaka, NdnPlugin, setPlayer);
  }, []);

  useEffect(() => {
    handleLoadVideo(player, clear, content);
  }, [content]);

  useEffect(() => {
    handleSetConfig();
  }, [config]);

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

  const handleSetConfig = () => {
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
          () => new BufferManager(() => player?.getBufferFullness(), player)
        );
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
      case "Neural Base":
        player.configure(
          "abrFactory",
          () => new Neural(() => player?.getBufferFullness(), net)
        );
        break;
      case "Throughput Base":
        player.configure("abrFactory", () => new shaka.abr.SimpleAbrManager());
        break;
    }
  };

  const handleLoadMetadata = (e) => {
    const duration = e?.target?.duration;
    const bufferingGoal = calculateDuration(duration);
    player.configure({
      streaming: {
        bufferingGoal,
      },
    });
  };

  const handleStats = () => {
    handleTimeUpdate(player, NdnPlugin, add);
  };

  return (
    <div>
      <RouterConnection />
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
            ref={video}
            onLoadedMetadata={handleLoadMetadata}
            onTimeUpdate={handleStats}
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

export default StreamPage;
