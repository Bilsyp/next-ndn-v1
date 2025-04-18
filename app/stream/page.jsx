"use client";
import shaka from "shaka-player";
import { Streaming } from "@/components/component/streaming";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQueue } from "@uidotdev/usehooks";
import { Connection } from "@/components/component/connection";
import { NdnPlugin } from "@/ndn/ndn-plugin";
import { usePapaParse } from "react-papaparse";
import SelectAbr from "@/components/component/selectabr";
import { Rate } from "@/abr/rate";
import { Hybrid } from "@/abr/hybrid";
import { Neural } from "@/abr/neural";
import {
  checkBrowserSupport,
  handleTimeUpdate,
  handleLoadVideo,
  calculateDuration,
} from "@/utils";
import { BufferManager } from "@/abr/bufferv2";
const Stream = () => {
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
        // player.resetConfiguration();

        break;
    }
  };
  const handleLoadMetadata = (e) => {
    const duration = e?.target?.duration;
    const bufferingGoal = calculateDuration(duration);
    player.configure({
      streaming: {
        // lowLatencyMode: true,
        bufferingGoal,
      },
    });
  };
  const handleStats = () => {
    handleTimeUpdate(player, NdnPlugin, add);
  };

  useEffect(() => {
    handleLoadVideo(player, clear, content);
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
      {/* <Script
        onLoad={async () => {
          const config = {
            binaryThresh: 0.5,
            hiddenLayers: [10], // array of ints for the sizes of the hidden layers in the network
            activation: "sigmoid", // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
            leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
          };

          // create a simple feed-forward neural network with backpropagation
          const net = new brain.NeuralNetwork(config);
          const timeStep = new brain.recurrent.LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          const test = await fetch(
            "https://raw.githubusercontent.com/Bilsyp/model_brainjs/master/model_v5.json"
          );
          const result = await test.json();
          net.fromJSON(result);
          setNet(net);
        }}
        // src="/model.js"s
        src="https://unpkg.com/brain.js@2.0.0-beta.23/dist/browser.js"
      ></Script> */}
    </div>
  );
};

export default Stream;
