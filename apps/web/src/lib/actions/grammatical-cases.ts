"use server";

import { generateGenetativeCase } from "@potuzhny-advokat/ai";
import { toGenitive as stringsToGenitive } from "@potuzhny-advokat/strings";
import { findCourt } from "@/lib/courts";

export async function toGenitive(fullname: string) {
    return stringsToGenitive(fullname);
}

export async function getCourtGenetative(courtName: string): Promise<string> {
    return findCourt(courtName)?.genetative ?? generateGenetativeCase(courtName);
}
