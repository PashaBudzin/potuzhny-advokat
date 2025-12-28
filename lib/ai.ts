"use server";

import { FileData, GoogleGenAI } from "@google/genai";
import { env } from "@/env";
import {
  extractPozovConfig,
  ExtractData,
  generatePozovConfig,
} from "./ai-configs/create-pozov-config";

const model = "gemini-flash-lite-latest";

async function extractPozovData(files: File[]) {
  if (!files || files.length == 0) {
    throw new Error("no files were provided");
  }
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const fileData: FileData[] = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], {
      type: file.type || "application/octet-stream",
    });
    const uploaded = await ai.files.upload({
      file: blob,
      config: { mimeType: file.type || "application/octet-stream" },
    });

    fileData.push({
      fileUri: uploaded.uri,
      mimeType: uploaded.mimeType,
    });
  }

  const res = await ai.models.generateContent({
    model,
    config: extractPozovConfig,
    contents: [...fileData.map((fd) => ({ role: "user", fileData: fd }))],
  });

  return res.candidates?.at(0);
}

async function generatePozov(pozovData: NonNullable<ExtractData["data"]>) {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const res = await ai.models.generateContentStream({
    model,
    config: generatePozovConfig,
    contents: [{ text: JSON.stringify(pozovData) }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of res) {
          controller.enqueue(encoder.encode(chunk?.text));
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

export { extractPozovData, generatePozov };
