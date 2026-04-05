import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cases = pgTable(
  "cases",
  {
    caseNumber: text("case_number").primaryKey(),
    state: text("state", {
      enum: ["registration", "ruling", "decision"],
    }),
    registrationDate: timestamp("registration_date"),
    lastUpdated: timestamp("last_updated"),
    plaintiffName: text("plaintiff_name"),
    plaintiffEmail: text("plaintiff_email"),
    plaintiffPhone: text("plaintiff_phone"),
    plaintiffAddress: text("plaintiff_address"),
    plaintiffIdNumber: text("plaintiff_id_number"),
    defendantName: text("defendant_name"),
    defendantEmail: text("defendant_email"),
    defendantPhone: text("defendant_phone"),
    defendantAddress: text("defendant_address"),
    defendantIdNumber: text("defendant_id_number"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    caseNumberIdx: "idx_case_number",
  })
);

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;