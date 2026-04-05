"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { env } from "@/env";
import {
  dataSchema,
  extractDataSchema,
  extractionPrompt,
} from "./ai-configs/create-pozov-config";
import legalDocsUa from "../../lib/ai-configs/skills/legal-docs-ua";

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = google("gemini-2.5-flash-lite");

async function extractPozovData(files: File[]) {
  if (!files || files.length === 0) {
    throw new Error("no files were provided");
  }

  const fileParts: Array<{
    type: "file";
    data: Uint8Array;
    mediaType: string;
  }> = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    fileParts.push({
      type: "file",
      data: uint8Array,
      mediaType: file.type || "application/octet-stream",
    });
  }

  const result = await generateText({
    model,
    messages: [
      {
        role: "user",
        content: fileParts,
      },
    ],
    system: extractionPrompt,
    output: Output.object({ schema: extractDataSchema }),
  });

  return JSON.parse(result.text);
}

async function generatePozov(pozovData: (typeof dataSchema)["_input"]) {
  const prompt = `Дані для створення позовної заяви про розірвання шлюбу:
${JSON.stringify(pozovData, null, 2)}

На основі наданих даних створи повний текст позовної заяви українською мовою, дотримуючись формату potuzhny-advokat-docx.`;

  const result = await generateText({
    model,
    system: legalDocsUa,
    messages: [{ role: "user", content: prompt }],
  });

  return result.text;
}

export { extractPozovData, generatePozov };
