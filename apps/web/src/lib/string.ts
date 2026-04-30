function splitName(fullname: string) {
    const lastName = fullname.split(" ")[0];
    const firstName = fullname.split(" ")[1];
    const middleName = fullname.split(" ")[2];

    return { firstName, middleName, lastName };
}
function initials(fullname: string) {
    const { lastName, firstName, middleName } = splitName(fullname);

    return lastName + " " + firstName[0] + "." + " " + middleName[0] + ".";
}

function firstBetween(text: string, startSplit: string, endSplit: string): string | null {
    const startRegex = new RegExp(startSplit, "i");
    const endRegex = new RegExp(endSplit, "i");

    return removeTags(text.split(startRegex)?.[1]?.split(endRegex)?.[0] ?? null);
}

function removeTags(text: string | null) {
    if (!text) return text;
    return text.replace(/<[^>]*>/g, "");
}

function normalizeAddress(text: string | null) {
    if (!text) return text;
    return text.replace(/,\s*Україна\s*,\s*\d+\s*$/i, "");
}

function normalizeCourtName(courtName: string | null) {
    if (!courtName) return null;
    return courtName
        .replace(/\s+м\.\s+/i, " міста ")
        .replace(/\s+м\.о\.\s+/i, " міста обласного значення ")
        .replace(/\s+Харківської\s+області$/i, "")
        .replace(/\s+Полтавської\s+області$/i, "")
        .replace(/\s+Львівської\s+області$/i, "")
        .replace(/\s+Одеської\s+області$/i, "")
        .replace(/\s+Дніпропетровської\s+області$/i, "")
        .replace(/\s+Донецької\s+області$/i, "")
        .replace(/\s+Запорізької\s+області$/i, "")
        .replace(/\s+Миколаївської\s+області$/i, "")
        .replace(/\s+Херсонської\s+області$/i, "")
        .replace(/\s+Сумської\s+області$/i, "")
        .replace(/\s+Чернігівської\s+області$/i, "")
        .replace(/\s+Черкаської\s+області$/i, "")
        .replace(/\s+Кіровоградської\s+області$/i, "")
        .replace(/\s+Житомирської\s+області$/i, "")
        .replace(/\s+Вінницької\s+області$/i, "")
        .replace(/\s+Хмельницької\s+області$/i, "")
        .replace(/\s+Тернопільської\s+області$/i, "")
        .replace(/\s+Рівненської\s+області$/i, "")
        .replace(/\s+Волинської\s+області$/i, "")
        .replace(/\s+Івано-Франківської\s+області$/i, "")
        .replace(/\s+Закарпатської\s+області$/i, "")
        .replace(/\s+Луганської\s+області$/i, "")
        .replace(/\s+Автономної\s+Республіки\s+Крим$/i, "")
        .trim();
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export {
    initials,
    firstBetween,
    removeTags,
    normalizeAddress,
    normalizeCourtName,
    splitName,
    formatBytes,
};
