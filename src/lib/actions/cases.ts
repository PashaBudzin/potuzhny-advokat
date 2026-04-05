"use server";

import { db } from "@/lib/accounting/db/db";
import { cases } from "@/lib/accounting/db/schema";
import { desc, asc, sql } from "drizzle-orm";

import { eq } from "drizzle-orm";

export type SortField = "lastUpdated" | "registrationDate" | "caseNumber";
export type SortOrder = "desc" | "asc";
export type CaseState = "registration" | "ruling" | "decision";

export async function getCases(
  offset: number = 0,
  limit: number = 50,
  sortField: SortField = "lastUpdated",
  sortOrder: SortOrder = "desc",
  state?: CaseState | null
) {
  const orderBy =
    sortField === "caseNumber"
      ? sortOrder === "desc"
        ? desc(cases.caseNumber)
        : asc(cases.caseNumber)
      : sortField === "registrationDate"
      ? sortOrder === "desc"
        ? desc(cases.registrationDate)
        : asc(cases.registrationDate)
      : sortOrder === "desc"
      ? desc(cases.lastUpdated)
      : asc(cases.lastUpdated);

  const query = db
    .select()
    .from(cases)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  if (state) {
    return query.where(eq(cases.state, state));
  }

  return query;
}

export async function getCasesCount(state?: CaseState | null): Promise<number> {
  if (state) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(eq(cases.state, state));
    return result[0]?.count ?? 0;
  }
  const result = await db.select({ count: sql<number>`count(*)` }).from(cases);
  return result[0]?.count ?? 0;
}