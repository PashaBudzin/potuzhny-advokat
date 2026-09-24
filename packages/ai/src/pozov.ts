import { generateText, Output } from "ai";
import {
    createPozovTemplateDataSchema,
    toAccusative,
    toInstrumental,
} from "@potuzhny-advokat/strings";

import { dataSchema, extractDataSchema, extractionPrompt } from "./create-pozov-config";
import { aiEnv } from "./env";
import { createProviders } from "./providers";

const pozovTemplateDataSchema = createPozovTemplateDataSchema({
    toInstrumental,
    toAccusative,
});

function models() {
    return createProviders(aiEnv());
}

/**
 * @deprecated
 */
export async function extractPozovData(files: File[]) {
    if (!files || files.length === 0) {
        throw new Error("no files were provided");
    }

    const filePromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
            type: "file" as const,
            data: new Uint8Array(arrayBuffer),
            mediaType: file.type || "application/octet-stream",
        };
    });
    const fileParts = await Promise.all(filePromises);

    const result = await generateText({
        model: models().mainModel,
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

export async function extractPozovTemplateData(files: File[], message = "") {
    if (!files || files.length === 0) {
        throw new Error("no files were provided");
    }

    const filePromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
            type: "file" as const,
            data: new Uint8Array(arrayBuffer),
            mediaType: file.type || "application/octet-stream",
        };
    });
    const fileParts = await Promise.all(filePromises);

    const result = await generateText({
        model: models().mainModel,
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

    return pozovTemplateDataSchema.parseAsync(JSON.parse(result.text));
}

/**
 * @deprecated
 */
export async function generatePozov(pozovData: (typeof dataSchema)["_input"]) {
    const prompt = `Дані для створення позовної заяви про розірвання шлюбу:
${JSON.stringify(pozovData, null, 2)}

На основі наданих даних створи повний текст позовної заяви українською мовою, дотримуючись формату potuzhny-advokat-docx.`;

    const result = await generateText({
        model: models().mainModel,
        messages: [{ role: "user", content: prompt }],
    });

    return result.text;
}

export async function generateGenetativeCase(phrase: string) {
    const result = await generateText({
        model: models().fastModel(),
        system: `Тобі дається іменник чи словосполучення, твоя задача сказати його й тільки його (більше ніяких слів) в родовому відмінку. Відповідь тільки українською.`,
        messages: [{ role: "user", content: phrase }],
    });

    return result.text;
}
