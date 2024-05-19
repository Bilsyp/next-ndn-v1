import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export async function GET(request) {
  try {
    const file = await fs.readFile(
      process.cwd() + "/app/api/model_v5.json",
      "utf8"
    );
    // Process the contents here
    return NextResponse.json({ file });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ message: "error" });

    // Handle the error here (e.g., return an error message)
  }
}
