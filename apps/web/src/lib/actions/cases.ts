"use server";

export type SortField = "lastUpdated" | "registrationDate" | "caseNumber";
export type SortOrder = "desc" | "asc";
export type CaseState = "registration" | "ruling" | "decision";

export async function getCourtGenetative(courtName: string): Promise<string> {
    const { generateGenetativeCase } = await import("@/lib/ai");
    return generateGenetativeCase(courtName);
}
