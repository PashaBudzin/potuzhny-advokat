import { atom } from "jotai";
import { type PozovTemplateData } from "@/lib/template-pozov-generator";

export const pozovFilesAtom = atom<File[]>([]);
export const pozovTemplateDataAtom = atom<PozovTemplateData | null>(null);
export const extractionStatusAtom = atom<
  "idle" | "extracting" | "success" | "error"
>("idle");
