import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";

import { parameter } from "@/lib/parameter";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateQoE, filterDuplicates } from "@/utils";
import SelectStats from "./selectStats";
import CsvReader from "./csvReader";

export function Statistics() {
  const [config, setConfig] = useState("");
  const [stat, setStat] = useState({
    latency: [],
    totalFrame: [],
    bufferingTimes: [],
  });
  const [dataQoe, setQoe] = useState([]);
  const convert = (arr, keys) =>
    arr.map((item) => {
      const obj = {};
      keys.forEach((key, index) => {
        obj[key] = parseFloat(item[index]);
      });
      return obj;
    });

  const handleUploadAccepted = (results, acceptedFile) => {
    const labels = parameter.map((item) => item.content);

    const result = convert(results.data.slice(1), labels);
    const uniqueData = filterDuplicates(
      result,
      parameter.map((item) => item.content)
    );

    const totalQoE = uniqueData.reduce(
      (sum, stats) => sum + calculateQoE(stats),
      0
    );

    const averageQoE = totalQoE / uniqueData.length;

    const abr = {
      name: acceptedFile.name,
      totalQoE: parseFloat(totalQoE.toFixed(2)),
      averageQoE: parseFloat(averageQoE.toFixed(2)),
    };
    setQoe(uniqueData);
  };
  const handleLatency = (results, acceptedFile) => {
    const labels = parameter.map((item) => item.content);
    const result = convert(results.data.slice(1), labels);
    const uniqueData = filterDuplicates(
      result,
      parameter.map((item) => item.content)
    );
    const decodedFrames = uniqueData
      .map((item) => item.decodedFrames)
      .reduce((a, b) => a + b);
    const dropFrames = uniqueData
      .map((item) => item.droppedFrames)
      .reduce((a, b) => a + b);
    const totalFrames = decodedFrames - dropFrames;
    const bufferingTime = uniqueData
      .map((item) => item.bufferingTime)
      .reduce((a, b) => a + b);
    setStat((prev) => {
      return {
        ...prev,
        latency: [
          ...prev.latency,
          {
            loadLatency: uniqueData[0].loadLatency,
            name: acceptedFile.name,
          },
        ],
        totalFrame: [
          ...prev.totalFrame,
          {
            totalFrames,
            name: acceptedFile.name,
          },
        ],
        bufferingTimes: [
          ...prev.bufferingTimes,
          {
            bufferingTime,
            name: acceptedFile.name,
          },
        ],
      };
    });
  };

  return (
    <main className="p-6 md:p-10">
      <CsvReader handleUploadAccepted={handleUploadAccepted} />
      <h1>Latency</h1>
      <CsvReader handleUploadAccepted={handleLatency} />
      <div className=" w-[70%] mx-auto">
        <SelectStats setconfig={setConfig} />
        <div className="grid ">
          <ChartLine data={dataQoe} config={config} className="aspect-[9/4]" />
          <ChartBar
            data={stat.bufferingTimes}
            config={"bufferingTime"}
            name="name"
            className="aspect-[9/4]"
          />
        </div>
      </div>
    </main>
  );
}

function ChartLine(props) {
  return (
    <div className={props.className}>
      <ResponsiveContainer width={"100%"} minHeight={300}>
        <LineChart width={500} height={500} data={props.data}>
          <CartesianGrid stroke="var(--muted)" />
          <XAxis dataKey={props.name} />
          <YAxis tickFormatter={(value) => `${value}`} />
          <Tooltip />
          <Line
            stroke="var(--primary)"
            type={"monotoneX"}
            dot={false}
            dataKey={props.config}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function ChartBar(props) {
  const colors = ["black"];
  const getPath = (x, y, width, height) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
    Z`;
  };

  const TriangleBar = (props) => {
    const { fill, x, y, width, height } = props;

    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };
  return (
    <div className={props.className}>
      <ResponsiveContainer width={"100%"} minHeight={300}>
        <BarChart width={500} height={500} data={props.data}>
          <CartesianGrid stroke="var(--muted)" />
          <XAxis dataKey={props.name} />
          <YAxis tickFormatter={(value) => `${value}ms`} />
          <Tooltip />
          <Bar
            dataKey={props.config}
            fill="#8884d8"
            shape={<TriangleBar />}
            label={{ position: "top" }}
          >
            {props.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 20]} />
            ))}
          </Bar>
          {/* <Bar stroke="var(--primary)" dataKey={props.config} /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
