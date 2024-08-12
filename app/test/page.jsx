"use client";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const page = () => {
  const [data, setData] = useState([
    {
      value: 12,
      datetime: new Date().toISOString(),
    },
    {
      value: 15,
      datetime: new Date().toISOString(),
    },
    {
      value: 30,
      datetime: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prevData) => [
        ...prevData,
        {
          value: Math.floor(Math.random() * 100),
          datetime: new Date().toISOString(),
        },
      ]);
    }, 5000);
    return () => clearInterval(timer);
  }, [data]);
  return (
    <div>
      <ChartLine data={data} />
    </div>
  );
};

function ChartLine({ data }) {
  return (
    <div className=" w-[80%] mx-auto my-10">
      <ResponsiveContainer width={"100%"} minHeight={300}>
        <LineChart width={500} height={500} data={data}>
          <CartesianGrid stroke="var(--muted)" />
          <XAxis dataKey={"datetime"} />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip />
          <Line stroke="var(--primary)" dot={false} dataKey={"value"} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default page;
