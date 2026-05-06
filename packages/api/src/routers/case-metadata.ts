import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";
import { db, cases } from "@potuzhny-advokat/db";
import { eq } from "drizzle-orm";

export const caseMetadataRouter = createTRPCRouter({
    updateCaseMetadata: publicProcedure
        .input(
            z.object({
                caseNumber: z.string(),
                data: z.object({
                    plaintiffName: z.string().optional().nullable(),
                    plaintiffAddress: z.string().optional().nullable(),
                    plaintiffCode: z.string().optional().nullable(),
                    defendantName: z.string().optional().nullable(),
                    defendantAddress: z.string().optional().nullable(),
                    defendantCode: z.string().optional().nullable(),
                    courtName: z.string().optional().nullable(),
                    judgeName: z.string().optional().nullable(),
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

export default caseMetadataRouter;
