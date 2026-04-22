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

  const normalizedName = normalizeCourtName(courtName);
  if (!normalizedName) return null;

  const court = courtsData.find(
    (c: Court) => normalizeCourtName(c.name) === normalizedName,
  );

  return court?.mail ?? null;
}
