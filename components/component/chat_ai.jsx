"use client";

import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { getGroqChatCompletion } from "@/groq/main";
import { remark } from "remark";
import html from "remark-html";
export function ChatAI() {
  async function main(content) {
    const chatCompletion = await getGroqChatCompletion(content);
    return chatCompletion;
  }
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm an AI assistant. How can I help you today?",
    },
  ]);

  const [inputText, setInputText] = useState("");

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() !== "") {
      processStream(await main(inputText));

      setInputText("");
    }
  };
  const processStream = async (chatCompletion) => {
    let accumulatedText = "";
    for await (const chunk of chatCompletion) {
      accumulatedText += chunk.choices[0]?.delta?.content || "";
      const processedText = await remark()
        .use(html, { sanitize: false })
        .process(accumulatedText);
      const htmlText = processedText.toString();
      setMessages([
        ...messages,
        { sender: "user", text: inputText },
        { sender: "bot", text: htmlText },
      ]);
    }
  };
  useEffect(() => {
    console.log(messages);
  }, [messages]);
  return (
    <div className="flex flex-col   h-screen">
      <header className="bg-gray-300 flex justify-between text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Groq AI Chat</h1>
        <h2 className="">Model llama3-8b-8192</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  message.sender === "user"
                    ? "bg-gray-50 text-white"
                    : "bg-gray-200  text-gray-800 "
                } rounded-lg p-4 max-w-[80%]`}
              >
                <article className=" prose ">{parse(message.text)}</article>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-100  p-4 flex items-center">
        <input
          onChange={handleInputChange}
          className="flex-1 bg-white  border-none rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          placeholder="Type your message..."
          type="text"
          value={inputText}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white rounded-lg py-2 px-4 ml-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
