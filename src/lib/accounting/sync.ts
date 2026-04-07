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
  hearing: 0,
};

function parseHearingDate(doc: TypedDocEmail): Date | null {
  const text = doc.content + "\n" + doc.title;
  const match = text.match(/призначено слухання\s+(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  const fullYear = year.length === 2 ? 2000 + +year : +year;
  return new Date(fullYear, +month - 1, +day, +hour, +minute);
}

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
  nextCourtHearing: Date | null;
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

    const hearingDocs = caseDocs.filter((d) => d.type === "hearing");
    const hearingDocsWithDates = hearingDocs
      .map((doc) => ({
        doc,
        hearingDate: parseHearingDate(doc),
      }))
      .filter((h) => h.hearingDate !== null)
      .sort((a, b) => (b.hearingDate!.getTime() - a.hearingDate!.getTime()));
    const nextCourtHearing = hearingDocsWithDates[0]?.hearingDate ?? null;

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
        nextCourtHearing,
      });
      changed = true;
    } else {
      const updates: Record<string, unknown> = {
        lastUpdated,
      };

      if (existing.state !== state) {
        updates.state = state;
      }

      if (nextCourtHearing) {
        updates.nextCourtHearing = nextCourtHearing;
      }

      if (Object.keys(updates).length > 1 || nextCourtHearing) {
        await db
          .update(cases)
          .set(updates)
          .where(eq(cases.caseNumber, caseNumber));
        changed = true;
      }
    }

    updates.push({
      caseNumber,
      state,
      registrationDate,
      lastUpdated,
      changed,
      plaintiffName,
      nextCourtHearing: nextCourtHearing ?? existing?.nextCourtHearing ?? null,
    });
  }

  return updates.filter((u) => u.changed);
}
