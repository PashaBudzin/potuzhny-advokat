import { type ExtractData } from "@/lib/ai-configs/create-pozov-config";
import { atom } from "jotai";

export const filesAtom = atom<File[]>([]);
export const pozovDataAtom = atom<ExtractData | null>(null);
export const pozovTypeAtom = atom<"розлучення" | "аліменти (Судовий наказ)">("розлучення");
