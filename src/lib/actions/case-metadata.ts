"use server";

import { db } from "@/lib/accounting/db/db";
import { cases } from "@/lib/accounting/db/schema";
import { eq } from "drizzle-orm";

export async function updateCaseMetadata(
  caseNumber: string,
  data: {
    plaintiffName?: string | null;
    plaintiffAddress?: string | null;
    plaintiffCode?: string | null;
    defendantName?: string | null;
    defendantAddress?: string | null;
    defendantCode?: string | null;
    courtName?: string | null;
    judgeName?: string | null;
  }
) {
  const existing = await db.query.cases.findFirst({
    where: (cases, { eq }) => eq(cases.caseNumber, caseNumber),
  });

  if (!existing) {
    return { success: false, error: "Case not found" };
  }

  await db
    .update(cases)
    .set({
      plaintiffName: data.plaintiffName ?? existing.plaintiffName,
      plaintiffAddress: data.plaintiffAddress ?? existing.plaintiffAddress,
      plaintiffCode: data.plaintiffCode ?? existing.plaintiffCode,
      defendantName: data.defendantName ?? existing.defendantName,
      defendantAddress: data.defendantAddress ?? existing.defendantAddress,
      defendantCode: data.defendantCode ?? existing.defendantCode,
      courtName: data.courtName ?? existing.courtName,
      judgeName: data.judgeName ?? existing.judgeName,
      updatedAt: new Date(),
    })
    .where(eq(cases.caseNumber, caseNumber));

  return { success: true };
}