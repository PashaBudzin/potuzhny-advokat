import { ToolLoopAgent, InferAgentUIMessage } from "ai";
import { google } from "@/lib/ai-providers";
import { and, gte, ilike, lte } from "drizzle-orm";
import { cases, db } from "@potuzhny-advokat/db";
import z from "zod";

const chatAgent = new ToolLoopAgent({
    model: google("gemini-2.5-flash-lite"),
    instructions: `Ти ШІ асистент системи потужний адвокат.
Коли передаєш дати для courtHearingDateRangeStart або courtHearingDateRangeEnd,
використовуй виключно американський формат MM/DD/YYYY (наприклад, March 15 2024 → "03/15/2024"), це правило не застосовуй для відповідей користувачу.

Сьогодні - ${new Date().toLocaleString("uk-UA")} (в Українському форматs)
Коли називаєш справу називай не тільки номер справи, але й прізвища позивачів.
`,
    tools: {
        getCases: {
            inputSchema: z.object({
                ilike_caseNumber: z
                    .string()
                    .optional()
                    .describe("ilike_caseNumber (as for substring search) номер справи для пошуку"),
                ilike_plaintiffName: z
                    .string()
                    .optional()
                    .describe(
                        "ilike_plaintiffName (as for substring search) пошук за іменем позивача",
                    ),
                courtHearingDateRangeStart: z
                    .string()
                    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format")
                    .optional()
                    .describe(
                        "courtHearingDateRangeStart - початок діапазону для пошуку справ за датою назначеного засідання. Формат дати: MM/DD/YYYY (американський, наприклад 03/15/2024)",
                    ),

                courtHearingDateRangeEnd: z
                    .string()
                    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format")
                    .optional()
                    .describe(
                        "courtHearingDateRangeEnd - кінець діапазону для пошуку справ за датою назначеного засідання. Формат дати: MM/DD/YYYY (американський, наприклад 04/15/2024)",
                    ),
                page: z.number().default(0).describe("page used for pagination (defaults to 0)"),
                pageSize: z
                    .number()
                    .default(20)
                    .describe("pageSize used for pagination (defaults to 20)"),
            }),
            execute: getCases,
        },
    },
    maxOutputTokens: 8192,
});

type ChatAgentUIMessage = InferAgentUIMessage<typeof chatAgent>;

export { chatAgent };
export type { ChatAgentUIMessage };

function parseDate(value: string): Date | undefined {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return undefined;
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? undefined : date;
}

async function getCases({
    ilike_caseNumber,
    ilike_plaintiffName,
    pageSize = 20,
    courtHearingDateRangeStart,
    courtHearingDateRangeEnd,
    page = 0,
}: {
    ilike_caseNumber?: string;
    ilike_plaintiffName?: string;
    courtHearingDateRangeStart?: string;
    courtHearingDateRangeEnd?: string;
    page: number;
    pageSize: number;
}) {
    const conditions = [];
    if (ilike_plaintiffName) conditions.push(ilike(cases.plaintiffName, ilike_plaintiffName));

    const startDate = courtHearingDateRangeStart
        ? parseDate(courtHearingDateRangeStart)
        : undefined;
    const endDate = courtHearingDateRangeEnd ? parseDate(courtHearingDateRangeEnd) : undefined;

    if (startDate) conditions.push(gte(cases.nextCourtHearing, startDate));

    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(cases.nextCourtHearing, endDate));
    }

    if (ilike_caseNumber) conditions.push(ilike(cases.caseNumber, ilike_caseNumber));

    return await db
        .select()
        .from(cases)
        .where(and(...conditions))
        .offset(pageSize * page)
        .limit(pageSize);
}
