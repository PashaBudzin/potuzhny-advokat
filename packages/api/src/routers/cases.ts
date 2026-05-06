import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { db, cases } from "@potuzhny-advokat/db";
import { desc, asc, sql } from "drizzle-orm";
import { eq, or, like, and } from "drizzle-orm";

export const casesRouter = createTRPCRouter({
    getCases: publicProcedure
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

    getCasesCount: publicProcedure
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

    getCasesWithHearings: publicProcedure.query(async () => {
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
});

export default casesRouter;
