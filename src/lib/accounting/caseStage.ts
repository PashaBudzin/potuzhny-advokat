import type { TypedDocEmail, DocType } from "./docType";

export type CaseState = "registration" | "ruling" | "decision";

export type CaseStage = {
  caseNumber: string;
  state: CaseState;
  registrationDate: Date | null;
  documents: TypedDocEmail[];
  lastUpdated: Date;
};

const STATE_PRIORITY: Record<DocType, number> = {
  registration: 1,
  ruling: 2,
  decision: 3,
  hearing: 0,
};

function getStateFromDocs(docs: TypedDocEmail[]): CaseState {
  let highestPriority = 0;

  for (const doc of docs) {
    const priority = STATE_PRIORITY[doc.type];
    if (priority > highestPriority) {
      highestPriority = priority;
    }
  }

  switch (highestPriority) {
    case 1:
      return "registration";
    case 2:
      return "ruling";
    case 3:
      return "decision";
    default:
      return "registration";
  }
}

export function groupDocsByCase(docs: TypedDocEmail[]): CaseStage[] {
  const caseMap = new Map<string, TypedDocEmail[]>();

  for (const doc of docs) {
    const existing = caseMap.get(doc.caseNumber) ?? [];
    existing.push(doc);
    caseMap.set(doc.caseNumber, existing);
  }

  const result: CaseStage[] = [];

  for (const [caseNumber, caseDocs] of caseMap) {
    const lastUpdated = caseDocs.reduce(
      (latest, doc) => (doc.date > latest ? doc.date : latest),
      new Date(0),
    );

    const registrationDoc = caseDocs.find((d) => d.type === "registration");
    const registrationDate = registrationDoc?.date ?? null;

    result.push({
      caseNumber,
      state: getStateFromDocs(caseDocs),
      registrationDate,
      documents: caseDocs,
      lastUpdated,
    });
  }

  result.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

  return result;
}

export function jsonToCsv<T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T)[],
): string {
  if (data.length === 0) return "";

  const keys = columns ?? (Object.keys(data[0]) as (keyof T)[]);
  const headers = keys.map(String);

  const rows = data.map((row) =>
    keys.map((key) => {
      const value = row[key];
      if (value === null || value === undefined) return "";
      if (typeof value === "string") {
        return value.includes(",") || value.includes('"')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }
      return String(value);
    }),
  );

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function casesToCsv(cases: CaseStage[]): string {
  const caseRows = cases.map((c) => ({
    caseNumber: c.caseNumber,
    state: c.state,
    registrationDate: c.registrationDate ? c.registrationDate.toISOString() : "",
    lastUpdated: c.lastUpdated.toISOString(),
    documentCount: c.documents.length,
  }));

  return jsonToCsv(caseRows);
}