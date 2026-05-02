import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cases = pgTable("cases", {
    caseNumber: text("case_number").primaryKey(),
    uniqueId: uuid("unique_id").defaultRandom().unique().notNull(),

    state: text("state", {
        enum: ["registration", "ruling", "decision", "hearing"],
    }).notNull(),

    registrationDate: timestamp("registration_date"),
    lastUpdated: timestamp("last_updated"),

    nextCourtHearing: timestamp("next_court_date"),

    courtName: text("court_name"),

    plaintiffName: text("plaintiff_name"),
    plaintiffAddress: text("plaintiff_address"),
    plaintiffCode: text("plaintiff_code"),

    judgeName: text("judge_name"),

    defendantName: text("defendant_name"),
    defendantAddress: text("defendant_address"),
    defendantCode: text("defendantCode"),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
