"use client";

import dynamic from "next/dynamic";
const Graph = dynamic(() => import("react-vis-network-graph"), {
  ssr: false,
});
const page = () => {
  const graph = {
    nodes: [
      { id: 1, label: "Node 1", title: "node 1" },
      { id: 2, label: "Node 2", title: "node 2" },
      { id: 3, label: "Node 3", title: "node 3" },
      { id: 4, label: "Client", title: "client" },
      { id: 5, label: "Node 5", title: "node 5" },
      { id: 6, label: "Node 6", title: "node 6" },
      { id: 7, label: "Node 7", title: "node 7" },
      { id: 8, label: "Node 8", title: "node 8" },
      { id: 9, label: "Producen", title: "producen" },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 3 },
      { from: 7, to: 3 },
      { from: 8, to: 1 },
      { from: 9, to: 6 },
    ],
  };
  return (
    <div className="h-screen">
      <header className="mx-auto text-center py-3">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-4xl lg:text-5xl">
          Topologi yang Sedang Diuji
        </h1>
        <p className="pt-3">
          Topologi ini sedang diuji dalam pengembangan lokal menggunakan Docker
          untuk membuat node sederhana.
        </p>
      </header>
      <Graph graph={graph} />
    </div>
  );
};

export default page;
