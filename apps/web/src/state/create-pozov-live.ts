import { atom } from "jotai";
import { type PozovTemplateData } from "@potuzhny-advokat/strings";

export const pozovFilesAtom = atom<File[]>([]);
export const pozovTemplateDataAtom = atom<PozovTemplateData | null>(null);
export const extractionStatusAtom = atom<"idle" | "extracting" | "success" | "error">("idle");
