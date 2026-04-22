"use server";

import { generateText, Output } from "ai";
import {
  dataSchema,
  extractDataSchema,
  extractionPrompt,
} from "./ai-configs/create-pozov-config";
import { fastModel, google } from "./ai-providers";
import { pozovTemplateDataSchema } from "./template-pozov-generator";

const model = google("gemini-2.5-flash-lite");

/**
 * @deprecated
 */
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

async function extractPozovTemplateData(files: File[], message = "") {
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
        content: message,
      },
      {
        role: "user",
        content: fileParts,
      },
    ],
    system: extractionPrompt,
    output: Output.object({ schema: pozovTemplateDataSchema }),
  });

  return JSON.parse(result.text);
}

/**
 * @deprecated
 */
async function generatePozov(pozovData: (typeof dataSchema)["_input"]) {
  const prompt = `Дані для створення позовної заяви про розірвання шлюбу:
${JSON.stringify(pozovData, null, 2)}

На основі наданих даних створи повний текст позовної заяви українською мовою, дотримуючись формату potuzhny-advokat-docx.`;

  const result = await generateText({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  return result.text;
}

export async function generateGenetativeCase(phrase: string) {
  const result = await generateText({
    model: fastModel(),
    system: `Тобі дається іменник чи словосполучення, твоя задача сказати його й тільки його (більше ніяких слів) в родовому відмінку. Відповідь тільки українською.`,
    messages: [{ role: "user", content: phrase }],
  });

  return result.text;
}

export { extractPozovData, extractPozovTemplateData, generatePozov };
