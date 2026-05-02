"use server";

import { db, cases } from "@potuzhny-advokat/db";
import { desc, asc, sql } from "drizzle-orm";

import { eq, or, like, and } from "drizzle-orm";

export type SortField = "lastUpdated" | "registrationDate" | "caseNumber";
export type SortOrder = "desc" | "asc";
export type CaseState = "registration" | "ruling" | "decision";

export async function getCases(
    offset: number = 0,
    limit: number = 50,
    sortField: SortField = "lastUpdated",
    sortOrder: SortOrder = "desc",
    state?: CaseState | null,
    search?: string | null,
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

    if (state && search) {
        return db
            .select()
            .from(cases)
            .where(
                and(
                    eq(cases.state, state),
                    or(
                        like(cases.caseNumber, `%${search}%`),
                        like(cases.plaintiffName, `%${search}%`),
                        like(cases.defendantName, `%${search}%`),
                        like(cases.courtName, `%${search}%`),
                        like(cases.judgeName, `%${search}%`),
                    ),
                ),
            )
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
    }

    if (state) {
        return db
            .select()
            .from(cases)
            .where(eq(cases.state, state))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
    }

    if (search) {
        return db
            .select()
            .from(cases)
            .where(
                or(
                    like(cases.caseNumber, `%${search}%`),
                    like(cases.plaintiffName, `%${search}%`),
                    like(cases.defendantName, `%${search}%`),
                    like(cases.courtName, `%${search}%`),
                    like(cases.judgeName, `%${search}%`),
                ),
            )
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
    }

    return db.select().from(cases).orderBy(orderBy).limit(limit).offset(offset);
}

export async function getCasesCount(
    state?: CaseState | null,
    search?: string | null,
): Promise<number> {
    if (state && search) {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(cases)
            .where(
                and(
                    eq(cases.state, state),
                    or(
                        like(cases.caseNumber, `%${search}%`),
                        like(cases.plaintiffName, `%${search}%`),
                        like(cases.defendantName, `%${search}%`),
                        like(cases.courtName, `%${search}%`),
                        like(cases.judgeName, `%${search}%`),
                    ),
                ),
            );
        return result[0]?.count ?? 0;
    }

    if (state) {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(cases)
            .where(eq(cases.state, state));
        return result[0]?.count ?? 0;
    }

    if (search) {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(cases)
            .where(
                or(
                    like(cases.caseNumber, `%${search}%`),
                    like(cases.plaintiffName, `%${search}%`),
                    like(cases.defendantName, `%${search}%`),
                    like(cases.courtName, `%${search}%`),
                    like(cases.judgeName, `%${search}%`),
                ),
            );
        return result[0]?.count ?? 0;
    }

    const result = await db.select({ count: sql<number>`count(*)` }).from(cases);
    return result[0]?.count ?? 0;
}

export async function getCourtGenetative(courtName: string): Promise<string> {
    const { generateGenetativeCase } = await import("@/lib/ai");
    return generateGenetativeCase(courtName);
}

export async function getCasesWithHearings() {
    return db
        .select({
            caseNumber: cases.caseNumber,
            nextCourtHearing: cases.nextCourtHearing,
            plaintiffName: cases.plaintiffName,
            plaintiffAddress: cases.plaintiffAddress,
            plaintiffCode: cases.plaintiffCode,
            defendantName: cases.defendantName,
            defendantAddress: cases.defendantAddress,
            defendantCode: cases.defendantCode,
            courtName: cases.courtName,
            judgeName: cases.judgeName,
        })
        .from(cases)
        .where(sql`${cases.nextCourtHearing} is not null`)
        .orderBy(asc(cases.nextCourtHearing));
}
