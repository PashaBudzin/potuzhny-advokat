"use server";

import * as shevchenko from "shevchenko";

const SEP = " ";

function parseAnthroponym(fullname: string) {
    const parts = fullname.split(" ");
    return {
        familyName: parts[0],
        givenName: parts[1],
        patronymicName: parts[2],
    };
}

function formatAnthroponym(res: { familyName: string; givenName: string; patronymicName: string }) {
    return res.familyName + SEP + res.givenName + SEP + res.patronymicName;
}

async function inflect(fullname: string, method: typeof shevchenko.inGenitive) {
    const anthroponym = parseAnthroponym(fullname);
    const gender = await shevchenko.detectGender(anthroponym);
    if (!gender) return null;
    const res = await method({ gender, ...anthroponym });
    return formatAnthroponym(res);
}

export async function toGenitive(fullname: string) {
    return inflect(fullname, shevchenko.inGenitive);
}

export async function toInstrumental(fullname: string) {
    return inflect(fullname, shevchenko.inAblative);
}

export async function toAccusative(fullname: string) {
    return inflect(fullname, shevchenko.inAccusative);
}

export async function getCourtGenetative(courtName: string): Promise<string> {
    const { generateGenetativeCase } = await import("@/lib/ai");
    return generateGenetativeCase(courtName);
}
