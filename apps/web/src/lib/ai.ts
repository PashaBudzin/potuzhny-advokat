"use server";

import {
    extractPozovData as aiExtractPozovData,
    extractPozovTemplateData as aiExtractPozovTemplateData,
} from "@potuzhny-advokat/ai";

export async function extractPozovData(files: File[]) {
    return aiExtractPozovData(files);
}

export async function extractPozovTemplateData(files: File[], message?: string) {
    return aiExtractPozovTemplateData(files, message ?? "");
}
