function intitials(fullname: string) {
  const firstName = fullname.split(" ")[1];
  const middleName = fullname.split(" ")[2];

  return firstName[0] + "." + middleName[0] + ".";
}

function firstBetween(
  text: string,
  startSplit: string,
  endSplit: string,
): string | null {
  return text.split(startSplit)?.at(1)?.split(endSplit)?.at(0) ?? null;
}

export { intitials, firstBetween };
