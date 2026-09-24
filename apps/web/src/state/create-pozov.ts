import { type ExtractData } from "@potuzhny-advokat/ai";
import { atom } from "jotai";

export const filesAtom = atom<File[]>([]);
export const pozovDataAtom = atom<ExtractData | null>(null);
export const pozovTypeAtom = atom<"розлучення" | "аліменти (Судовий наказ)">("розлучення");
