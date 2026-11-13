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

export type CourtRecord = Pick<Court, "name" | "genetative"> &
    Partial<Pick<Court, "mail" | "city" | "region">>;

type LocationKind = "city" | "region";

type LocationHint = {
    kind: LocationKind;
    value: string;
};

type ParsedCourtInput = {
    keys: string[];
    hints: LocationHint[];
};

const COURTS: Court[] = courtsData;

const REGION_ENTRIES = [...new Set(COURTS.map((court) => court.region))]
    .map((region) => {
        const value = fold(region);

        return { value, stem: value.replace(/а$/, "") };
    })
    .sort((left, right) => right.stem.length - left.stem.length);

const CITY_ALIASES: Record<string, string> = {
    києва: "київ",
};

const REGION_SUFFIX = /(?:^|\s)([А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*)\s+(?:області|область|обл\.?)\s*$/i;
const CRIMEA_SUFFIX = /(?:^|\s)(Автономної\s+Республіки\s+Крим|АР\s+Крим)\s*$/i;
const CITY_SUFFIX =
    /(?:^|\s)(?:м\.(?!\s*о\.)|місто|міста)\s*([А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*(?:\s+[А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*)*)\s*$/i;

function fold(value: string): string {
    return value
        .toLowerCase()
        .replace(/[’ʼ`]/g, "'")
        .replace(/[^a-zа-яіїєґ0-9'\-\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeSearchKey(input: string | null): string | null {
    if (!input) return null;

    const normalized = normalizeCourtName(input);
    if (!normalized) return null;

    return fold(normalized);
}

function canonicalRegion(input: string): string | null {
    const value = fold(input);

    for (const region of REGION_ENTRIES) {
        if (value.startsWith(region.stem)) return region.value;
    }

    return null;
}

function canonicalCity(input: string): string {
    const value = fold(input);

    return CITY_ALIASES[value] ?? value;
}

function parseCourtInput(input: string): ParsedCourtInput {
    const hints: LocationHint[] = [];
    let withoutLocation = input;

    const regionMatch = withoutLocation.match(REGION_SUFFIX);
    if (regionMatch?.[1]) {
        const value = canonicalRegion(regionMatch[1]);

        if (value) {
            hints.push({ kind: "region", value });
            withoutLocation = withoutLocation.slice(0, regionMatch.index ?? 0).trim();
        }
    } else {
        const crimeaMatch = withoutLocation.match(CRIMEA_SUFFIX);

        if (crimeaMatch) {
            hints.push({ kind: "region", value: fold("Крим") });
            withoutLocation = withoutLocation.slice(0, crimeaMatch.index ?? 0).trim();
        }
    }

    const cityMatch = withoutLocation.match(CITY_SUFFIX);
    if (cityMatch?.[1]) {
        hints.push({ kind: "city", value: canonicalCity(cityMatch[1]) });
        withoutLocation = withoutLocation.slice(0, cityMatch.index ?? 0).trim();
    }

    const fullKey = normalizeSearchKey(input);
    const strippedKey = normalizeSearchKey(withoutLocation);
    const keys = [...new Set([fullKey, strippedKey].filter((key): key is string => key !== null))];

    return { keys, hints };
}

function hasCityPhrase(key: string | null, city: string): boolean {
    if (!key) return false;

    return key.includes(`міста ${city}`) || key.includes(`місто ${city}`);
}

function matchesLocation(court: CourtRecord, hints: readonly LocationHint[]): boolean {
    if (hints.length === 0) return true;

    const nameKey = normalizeSearchKey(court.name);
    const genitiveKey = normalizeSearchKey(court.genetative);

    return hints.every((hint) => {
        if (hint.kind === "region") {
            return court.region !== undefined && fold(court.region) === hint.value;
        }

        if (court.city !== undefined && fold(court.city) === hint.value) return true;

        return hasCityPhrase(nameKey, hint.value) || hasCityPhrase(genitiveKey, hint.value);
    });
}

function filterByLocation<T extends CourtRecord>(
    courts: readonly T[],
    hints: readonly LocationHint[],
): T[] {
    if (hints.length === 0) return [...courts];

    return courts.filter((court) => matchesLocation(court, hints));
}

function collectByKey<T extends CourtRecord>(
    courts: readonly T[],
    keys: readonly string[],
    keyOf: (court: T) => string | null,
): T[] {
    const matches: T[] = [];
    const seen = new Set<T>();

    for (const court of courts) {
        const key = keyOf(court);
        if (!key || !keys.includes(key) || seen.has(court)) continue;

        seen.add(court);
        matches.push(court);
    }

    return matches;
}

function collectByPrefix<T extends CourtRecord>(
    courts: readonly T[],
    keys: readonly string[],
): T[] {
    const matches: T[] = [];
    const seen = new Set<T>();

    for (const court of courts) {
        const nameKey = normalizeSearchKey(court.name);
        if (!nameKey || seen.has(court)) continue;

        const matchesPrefix = keys.some((key) => nameKey === key || nameKey.startsWith(`${key} `));
        if (!matchesPrefix) continue;

        seen.add(court);
        matches.push(court);
    }

    return matches;
}

export function findCourtIn<T extends CourtRecord>(
    courts: readonly T[],
    input: string | null,
): T | null {
    if (!input) return null;

    const { keys, hints } = parseCourtInput(input);
    if (keys.length === 0) return null;

    if (hints.length > 0) {
        const nameMatches = filterByLocation(
            collectByKey(courts, keys, (court) => normalizeSearchKey(court.name)),
            hints,
        );

        if (nameMatches.length === 1) return nameMatches[0] ?? null;
        if (nameMatches.length > 1) return null;

        const genitiveMatches = filterByLocation(
            collectByKey(courts, keys, (court) => normalizeSearchKey(court.genetative)),
            hints,
        );

        if (genitiveMatches.length === 1) return genitiveMatches[0] ?? null;
        if (genitiveMatches.length > 1) return null;

        const prefixMatches = filterByLocation(collectByPrefix(courts, keys), hints);

        return prefixMatches.length === 1 ? (prefixMatches[0] ?? null) : null;
    }

    const nameMatches = collectByPrefix(courts, keys);

    if (nameMatches.length === 1) return nameMatches[0] ?? null;
    if (nameMatches.length > 1) return null;

    const genitiveMatches = collectByKey(courts, keys, (court) =>
        normalizeSearchKey(court.genetative),
    );

    return genitiveMatches.length === 1 ? (genitiveMatches[0] ?? null) : null;
}

export function findCourt(input: string | null): Court | null {
    return findCourtIn(COURTS, input);
}

export function getCourtEmail(courtName: string | null): string | null {
    return findCourt(courtName)?.mail ?? null;
}
