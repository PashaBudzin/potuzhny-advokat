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
}

export function getCourtEmail(courtName: string | null): string | null {
    if (!courtName) return null;

    const normalizedInput = normalizeCourtName(courtName);
    if (!normalizedInput) return null;

    const exactMatch = courtsData.find(
        (c: Court) => normalizeCourtName(c.name) === normalizedInput,
    );
    if (exactMatch) return exactMatch.mail;

    const fuzzyMatch = courtsData.find((c: Court) => {
        const normalizedDbName = normalizeCourtName(c.name);
        if (!normalizedDbName) return false;

        return (
            normalizedDbName.includes(normalizedInput) || normalizedInput.includes(normalizedDbName)
        );
    });

    return fuzzyMatch?.mail ?? null;
}
