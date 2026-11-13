export function splitName(fullname: string) {
    const lastName = fullname.split(" ")[0];
    const firstName = fullname.split(" ")[1];
    const middleName = fullname.split(" ")[2];

    return { firstName, middleName, lastName };
}

export function initials(fullname: string) {
    const { lastName, firstName, middleName } = splitName(fullname);

    return `${lastName} ${firstName[0]}. ${middleName[0]}.`;
}

export function firstBetween(text: string, startSplit: string, endSplit: string): string | null {
    const startRegex = new RegExp(startSplit, "i");
    const endRegex = new RegExp(endSplit, "i");

    return removeTags(text.split(startRegex)?.[1]?.split(endRegex)?.[0] ?? null);
}

export function removeTags(text: string | null) {
    if (!text) return text;
    return text.replace(/<[^>]*>/g, "");
}

export function normalizeAddress(text: string | null) {
    if (!text) return text;
    return text.replace(/,\s*Україна\s*,\s*\d+\s*$/i, "");
}

export function normalizeName(name: string) {
    return name.split(".")[0].split(";")[0].split(",")[0];
}

export function normalizeCourtName(courtName: string | null) {
    if (!courtName) return null;
    return courtName
        .replace(/(^|[\s(])м\.\s*о\.\s*/gi, "$1міста обласного значення ")
        .replace(/(^|[\s(])м\.\s*/gi, "$1міста ")
        .replace(/\s+[А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*ої\s+області$/gi, "")
        .replace(/\s+[А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*а\s+область$/gi, "")
        .replace(/\s+[А-ЯІЇЄҐ][А-Яа-яІіЇїЄєҐґ'’-]*(?:ої|а)\s+обл\.?$/gi, "")
        .replace(/\s+Автономної\s+Республіки\s+Крим$/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
