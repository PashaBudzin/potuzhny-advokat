import { db, cases, type NewCase } from "@potuzhny-advokat/db";
import { eq } from "drizzle-orm";

/**
 * What a scrape of a court's document page knows about a case.
 *
 * Every field except the case number is optional: the cabinet publishes
 * different tags on different documents, and a page that names no address is
 * not a reason to refuse the run.
 */
export type CaseDetails = {
    /** Court case number, the `cases` primary key. */
    caseNumber: string;
    /** Court that hears the case, in the nominative. */
    courtName?: string;
    /** Plaintiff, cleaned of the markup and qualifiers the court adds. */
    plaintiffName?: string;
    /** Plaintiff postal address, normalised. */
    plaintiffAddress?: string;
    /** Plaintiff tax number. */
    plaintiffCode?: string;
    /** Defendant — the party behind the firm when the firm is itself a side. */
    defendantName?: string;
    /** Defendant postal address, normalised. */
    defendantAddress?: string;
    /** Defendant tax number. */
    defendantCode?: string;
    /** Judge the case is assigned to. */
    judgeName?: string;
    /** Date the incoming document was registered. */
    registrationDate?: Date;
};

/** The `cases` columns a {@link CaseDetails} can fill, and nothing else. */
const DETAIL_COLUMNS = [
    "courtName",
    "plaintiffName",
    "plaintiffAddress",
    "plaintiffCode",
    "defendantName",
    "defendantAddress",
    "defendantCode",
    "judgeName",
    "registrationDate",
] as const satisfies readonly (keyof CaseDetails)[];

/** One of the {@link DETAIL_COLUMNS}, named the way `cases` names it. */
type DetailColumn = (typeof DETAIL_COLUMNS)[number];

/**
 * Those columns as `cases` accepts them, all of them optional.
 *
 * Optional because "the page said nothing" has to be expressible, and it is not
 * the same as "the page said empty" — see {@link present}.
 */
type DetailsRow = Partial<Pick<NewCase, DetailColumn>>;

/** What an {@link upsertCaseDetails} call did to the database. */
export type CaseDetailsWrite = {
    /** Case the details belong to. */
    caseNumber: string;
    /** Whether the row had to be inserted rather than updated. */
    created: boolean;
    /** Columns that were actually written, in schema order. */
    changed: DetailColumn[];
};

/**
 * Keeps the values worth writing and drops everything an unusable value can
 * look like.
 *
 * The cabinet leaves tags empty, and the AI address normalisation can fail and
 * hand back nothing. An empty string is not the same as a cleared field, so
 * treating it as one would let a page without an address erase the address
 * that is already on file. A field the scrape has nothing for is left off
 * entirely, which the database reads as "keep what is there".
 */
function present(details: CaseDetails): DetailsRow {
    const row: DetailsRow = {};

    if (details.courtName) row.courtName = details.courtName;
    if (details.plaintiffName) row.plaintiffName = details.plaintiffName;
    if (details.plaintiffAddress) row.plaintiffAddress = details.plaintiffAddress;
    if (details.plaintiffCode) row.plaintiffCode = details.plaintiffCode;
    if (details.defendantName) row.defendantName = details.defendantName;
    if (details.defendantAddress) row.defendantAddress = details.defendantAddress;
    if (details.defendantCode) row.defendantCode = details.defendantCode;
    if (details.judgeName) row.judgeName = details.judgeName;
    if (details.registrationDate) row.registrationDate = details.registrationDate;

    return row;
}

/**
 * Whether a scraped value says the same thing as the value on file.
 *
 * Dates are compared by instant rather than by identity, so the same day
 * scraped twice is not mistaken for a change.
 */
function sameValue(written: NewCase[DetailColumn], stored: NewCase[DetailColumn]): boolean {
    if (written instanceof Date && stored instanceof Date) {
        return written.getTime() === stored.getTime();
    }

    return written === stored;
}

/**
 * Writes what a court document says about a case into the `cases` table.
 *
 * A case the accounting pipeline already knows about is updated, one it has
 * never seen is inserted as a `registration` — the state the cabinet itself
 * reports, and the one `updateCaseStates` gives a case whose only document is
 * its registration card. Only the columns that genuinely differ are written, so
 * re-reading an unchanged case leaves the row's `updated_at` alone and a reader
 * can tell "re-scraped and identical" from "re-scraped and different".
 *
 * @param details - What the document page carried; `caseNumber` is required,
 *   every other field optional.
 * @returns Whether the row was created and which columns were written.
 * @throws {Error} If no case number was given, or the database rejects the write.
 */
export async function upsertCaseDetails(details: CaseDetails): Promise<CaseDetailsWrite> {
    const caseNumber = details.caseNumber.trim();
    if (!caseNumber) throw new Error("case details carry no case number");

    const row = present(details);
    const existing = await db.query.cases.findFirst({
        where: (cases, { eq }) => eq(cases.caseNumber, caseNumber),
    });

    if (!existing) {
        const written = DETAIL_COLUMNS.filter((column) => row[column] !== undefined);

        await db.insert(cases).values({ caseNumber, state: "registration", ...row });

        return { caseNumber, created: true, changed: written };
    }

    const changes: Record<string, unknown> = {};

    for (const column of DETAIL_COLUMNS) {
        const value = row[column];
        if (value === undefined) continue;
        if (sameValue(value, existing[column])) continue;

        changes[column] = value;
    }

    const changed = DETAIL_COLUMNS.filter((column) => column in changes);
    if (changed.length === 0) return { caseNumber, created: false, changed: [] };

    await db
        .update(cases)
        .set({ ...changes, updatedAt: new Date() })
        .where(eq(cases.caseNumber, caseNumber));

    return { caseNumber, created: false, changed };
}
