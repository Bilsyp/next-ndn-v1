"use client";
import { useNetworkState } from "@uidotdev/usehooks";

const page = () => {
  const network = useNetworkState();
  const test = () => {
    console.log(network);
  };
  return (
    <div>
      <button onClick={test}>See</button>
    </div>
  );
};

export default page;
