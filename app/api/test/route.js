import { NextResponse } from "next/server";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
const chatModel = new ChatOllama({
  baseUrl: "http://localhost:11434", // Default value
  model: "deepseek-coder:1.3b",
});
export async function GET(request) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", ""],
    ["user", "{input}"],
  ]);

  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(chatModel).pipe(outputParser);
  const response = await chain.invoke({
    input: "create simple function hello world c++",
  });
  return NextResponse.json({ response });
}
export async function POST(request) {
  const req = new URL(request.url);

  console.log(req.searchParams.get("name"));
  return NextResponse.json({ message: "ok" });
}
