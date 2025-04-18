"use client";

import { useState, useEffect } from "react";

const Page = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      let res = await fetch("/api/predict");
      let data = await res.json();
      setPosts(data);
      console.log(data);
    }
    fetchPosts();
  }, []);

  return <div>Page</div>;
};

export default Page;
