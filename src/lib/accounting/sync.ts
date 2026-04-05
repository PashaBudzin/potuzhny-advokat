import { db } from "./db/db";
import { cases } from "./db/schema";
import { eq } from "drizzle-orm";
import type { TypedDocEmail, DocType } from "./docType";
import type { CaseStage } from "./caseStage";
import { CaseStateSummary } from "./summary";

const STATE_PRIORITY: Record<DocType, number> = {
  registration: 1,
  ruling: 2,
  decision: 3,
};

function getStateFromDocs(docs: TypedDocEmail[]): CaseStage["state"] {
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

export type CaseUpdate = {
  caseNumber: string;
  state: CaseStage["state"];
  registrationDate: Date | null;
  lastUpdated: Date;
  changed: boolean;
  plaintiffName: string | null;
};

export async function updateCaseStates(
  typedEmails: TypedDocEmail[],
): Promise<CaseUpdate[]> {
  const updates: CaseUpdate[] = [];
  const caseMap = new Map<string, TypedDocEmail[]>();

  for (const doc of typedEmails) {
    const existing = caseMap.get(doc.caseNumber) ?? [];
    existing.push(doc);
    caseMap.set(doc.caseNumber, existing);
  }

  for (const [caseNumber, caseDocs] of caseMap) {
    const state = getStateFromDocs(caseDocs);
    const registrationDoc = caseDocs.find((d) => d.type === "registration");
    const registrationDate = registrationDoc?.date ?? null;
    const lastUpdated = caseDocs.reduce(
      (latest, doc) => (doc.date > latest ? doc.date : latest),
      new Date(0),
    );

    const existing = await db.query.cases.findFirst({
      where: (cases, { eq }) => eq(cases.caseNumber, caseNumber),
    });

    let changed = false;
    const plaintiffName = existing?.plaintiffName ?? null;

    if (!existing) {
      await db.insert(cases).values({
        caseNumber,
        state,
        registrationDate,
        lastUpdated,
      });
      changed = true;
    } else if (existing.state !== state) {
      await db
        .update(cases)
        .set({
          state,
          lastUpdated,
        })
        .where(eq(cases.caseNumber, caseNumber));
      changed = true;
    }

    updates.push({
      caseNumber,
      state,
      registrationDate,
      lastUpdated,
      changed,
      plaintiffName,
    });
  }

  return updates.filter((u) => u.changed);
}
