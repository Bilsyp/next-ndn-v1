"use client";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

const page = () => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = { name, content };
    setLoading(true);
    await fetching(data);
    setLoading(false);
    setContent("");
    setName("");
  };
  const fetching = async (data) => {
    try {
      const send = await fetch("http://localhost:4747/ndn/uploads", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch {
      console.log("something wrong");
    }
  };
  return (
    <div className="h-[90vh] flex justify-center items-center w-full ">
      <form
        action=""
        className="mx-auto border flex flex-col gap-8 p-3 rounded-md min-w-[500px]"
      >
        <input
          onChange={(e) => setName(e.target.value)}
          type="text"
          value={name}
          className="py-3 rounded-md border-b-2 border-slate-900 outline-none"
          placeholder="Name.. /ndn/"
        />
        <input
          onChange={(e) => setContent(e.target.value)}
          type="text"
          value={content}
          className="py-3 rounded-md border-b-2 border-slate-900 outline-none"
          placeholder="Content"
        />
        <button
          onClick={onSubmit}
          className="btn bg-slate-800 text-white font-semibold rounded-md py-3 hover:opacity-75 duration-500"
          type="submit"
        >
          Send Name{" "}
          {loading && (
            <LoaderCircle className=" animate-spin duration-300 inline" />
          )}
        </button>
      </form>
    </div>
  );
};

export default page;
