import courtsData from "../../public/courts.json";
import { normalizeCourtName } from "./string";

export interface Court {
    name: string;
    publisherId: string;
    zipCode: string;
    city: string;
    legalAddress: string;
    mail: string;
    region: string;
    genetative: string;
}

function normalizeSearchKey(input: string): string | null {
    const normalized = normalizeCourtName(input);
    if (!normalized) return null;
    return normalized.replace(/\s+/g, " ").trim();
}

export function findCourt(input: string | null): Court | null {
    if (!input) return null;

    const key = normalizeSearchKey(input);
    if (!key) return null;

    const exactMatch = courtsData.find((c: Court) => normalizeSearchKey(c.name) === key);
    if (exactMatch) return exactMatch;

    const genitiveMatch = courtsData.find((c: Court) => normalizeSearchKey(c.genetative) === key);
    if (genitiveMatch) return genitiveMatch;

    const fuzzyMatch = courtsData.find((c: Court) => {
        const dbKey = normalizeSearchKey(c.name);
        if (!dbKey) return false;

        if (key.length >= 5) {
            return dbKey.includes(key) || key.includes(dbKey);
        }

        return dbKey === key;
    });

    return fuzzyMatch ?? null;
}

export function getCourtEmail(courtName: string | null): string | null {
    return findCourt(courtName)?.mail ?? null;
}
