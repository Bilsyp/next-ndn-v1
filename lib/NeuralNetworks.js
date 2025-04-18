import { Layer, Network } from "synaptic";

function createNetwork() {
  const inputLayer = new Layer(3); // Input: latency, bandwidth, buffer
  const hiddenLayer = new Layer(5); // Hidden layer
  const outputLayer = new Layer(1); // Output: bitrate

  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);

  const network = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer,
  });

  return network;
}

// Fungsi untuk training
function trainNetwork(network, trainingData, iterations = 10000, rate = 0.1) {
  for (let i = 0; i < iterations; i++) {
    trainingData.forEach((data) => {
      network.activate(data.input);
      network.propagate(rate, data.output);
    });
  }
}

export { trainNetwork, createNetwork };
