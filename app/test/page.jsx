"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Script from "next/script";
import React, { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
const page = () => {
  const [net, setNet] = useState();
  const [data, setData] = useState([
    {
      day: "senin",
      restaurant: "KFC",
      customers: 50,
      bandwidth: 1000,
      variant: 1200,
    },
    {
      day: "selasa",
      restaurant: "McDonald's",
      customers: 30,
      bandwidth: 1500,
      variant: 1800,
    },
    {
      day: "rabu",
      restaurant: "Burger King",
      customers: 45,
      bandwidth: 2000,
      variant: 2200,
    },
    {
      day: "kamis",
      restaurant: "KFC",
      customers: 60,
      bandwidth: 3500,
      variant: 4200,
    },
    {
      day: "jumat",
      restaurant: "McDonald's",
      customers: 40,
      bandwidth: 5000,
      variant: 5500,
    },
    {
      day: "sabtu",
      restaurant: "Burger King",
      customers: 70,
      bandwidth: 7000,
      variant: 7200,
    },
    {
      day: "minggu",
      restaurant: "KFC",
      customers: 80,
      bandwidth: 8000,
      variant: 8200,
    },
  ]);
  const [result, setResult] = useState([]);
  const normalisasi = (data, input, output) => {
    let result = [];
    for (let index in data) {
      result.push({
        input: { [data[index][input]]: 1 },
        output: { [data[index][output]]: 1 },
      });
    }
    return result;
  };
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    setData((prev) => {
      return [...prev, data];
    });
  };
  const trainModel = () => {
    const test = normalisasi(data, "bandwidth", "variant");
    net.train(test);
    let result = net.run({ ["1000"]: 1 });
    let finallTest = [];
    for (const key in result) {
      const testResult = result[key];
      finallTest.push([
        {
          bandwidth: key,
          variant: testResult,
        },
      ]);
    }
    const po = finallTest.sort((a, b) => {
      return b.variant - a.variant;
    });
    console.log(po);
    setResult(finallTest);
  };
  return (
    <div className=" max-w-xl mx-auto my-4">
      <form onSubmit={handleSubmit(onSubmit)} className=" flex flex-col gap-8">
        <Input placeholder="Day" {...register("day")} />
        <Input
          placeholder="Restaurant"
          {...register("restaurant", { required: true })}
        />
        <Input
          placeholder="Customers"
          {...register("customers", { required: true })}
        />
        <Button type="submit">send</Button>
      </form>
      <label className=" w-full pt-6 block">Target Train</label>
      <select className=" w-full my-3 border p-3">
        {data.map((item, index) => {
          return (
            <option value={item.day} key={index}>
              {item.day}
            </option>
          );
        })}
      </select>
      <Button className="mt-3 w-full" onClick={trainModel}>
        Train Model
      </Button>
      <ul className="py-4">
        {result.length > 0 &&
          result?.map((item, index) => {
            return (
              <li key={index} className=" border rounded-md p-3 ">
                <h1>bandwidth : {item[0].bandwidth}</h1>
                <h1>result : {item[0].variant}</h1>
              </li>
            );
          })}
      </ul>
      <Script
        onLoad={() => {
          const config = {
            binaryThresh: 0.5,
            hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
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

          setNet(net);
          console.log(net);
        }}
        src="/model.js"
        // src="https://unpkg.com/brain.js@2.0.0-beta.23/dist/browser.js"
      ></Script>
    </div>
  );
};

export default page;
