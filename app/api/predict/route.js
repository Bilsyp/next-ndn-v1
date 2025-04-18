import { NextResponse } from "next/server";
import { createNetwork } from "@/lib/NeuralNetworks";

const network = createNetwork();

// Train network saat server start (contoh data training)
const trainingData = [
  { input: [0.5, 0.8, 0.2], output: [0.5] }, // 540p
  { input: [0.2, 1.0, 0.1], output: [0.8] }, // 720p
  { input: [0.9, 0.4, 0.5], output: [0.3] }, // 360p
  { input: [0.1, 0.9, 0.1], output: [1.0] }, // 1080p
];
network.activate(trainingData[0].input); // Initialize
trainingData.forEach((data) => network.propagate(0.1, data.output)); // Train

export async function GET() {
  const input = [80 / 100, 10 / 150, 30 / 1];

  const output = network.activate(input);

  return NextResponse.json({
    name: "ok",
    bitrate: Math.round(output[0] * 1080),
  });
}
