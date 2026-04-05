function initials(fullname: string) {
  const lastName = fullname.split(" ")[0];
  const firstName = fullname.split(" ")[1];
  const middleName = fullname.split(" ")[2];

  return lastName + " " + firstName[0] + "." + " " + middleName[0] + ".";
}

function firstBetween(
  text: string,
  startSplit: string,
  endSplit: string,
): string | null {
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

export { initials, firstBetween, removeTags, normalizeAddress };
