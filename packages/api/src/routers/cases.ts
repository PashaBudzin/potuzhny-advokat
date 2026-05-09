import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db, cases } from "@potuzhny-advokat/db";
import { desc, asc, sql } from "drizzle-orm";
import { eq, or, like, and } from "drizzle-orm";

export const casesRouter = createTRPCRouter({
    getCases: protectedProcedure
        .input(
            z.object({
                offset: z.number().optional().default(0),
                limit: z.number().optional().default(50),
                sortField: z
                    .enum(["lastUpdated", "registrationDate", "caseNumber"])
                    .optional()
                    .default("lastUpdated"),
                sortOrder: z.enum(["desc", "asc"]).optional().default("desc"),
                state: z
                    .union([z.literal("registration"), z.literal("ruling"), z.literal("decision")])
                    .optional()
                    .nullable(),
                search: z.string().optional().nullable(),
            }),
        )
        .query(async ({ input }) => {
            const { offset, limit, sortField, sortOrder, state, search } = input;

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
        }),

    getCasesCount: protectedProcedure
        .input(
            z.object({
                state: z
                    .union([z.literal("registration"), z.literal("ruling"), z.literal("decision")])
                    .optional()
                    .nullable(),
                search: z.string().optional().nullable(),
            }),
        )
        .query(async ({ input }) => {
            const { state, search } = input;
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
        }),

    getCasesWithHearings: protectedProcedure.query(async () => {
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
    }),

    updateCaseMetadata: protectedProcedure
        .input(
            z.object({
                caseNumber: z.string(),
                data: z.object({
                    plaintiffName: z.string().nullable().optional(),
                    plaintiffAddress: z.string().nullable().optional(),
                    plaintiffCode: z.string().nullable().optional(),
                    defendantName: z.string().nullable().optional(),
                    defendantAddress: z.string().nullable().optional(),
                    defendantCode: z.string().nullable().optional(),
                    courtName: z.string().nullable().optional(),
                    judgeName: z.string().nullable().optional(),
                }),
            }),
        )
        .mutation(async ({ input }) => {
            const { caseNumber, data } = input;

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
        }),
});

export default casesRouter;
