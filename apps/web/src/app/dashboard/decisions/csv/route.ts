import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { env } from "@/env";
import { fetchAndTypeEmails, jsonToCsv } from "@potuzhny-advokat/accounting";
import { db, cases } from "@potuzhny-advokat/db";
import { isAuthenticated } from "@/lib/auth-server";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!env.IMAP_PASS || !env.IMAP_USER) {
        return NextResponse.json({ message: "IMAP credentials not configured" }, { status: 500 });
    }

    const fromParam = request.nextUrl.searchParams.get("from");
    const since = fromParam ? new Date(fromParam) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    if (isNaN(since.getTime())) {
        return NextResponse.json(
            { message: "Invalid date format. Use YYYY-MM-DD." },
            { status: 400 },
        );
    }

    const typedEmails = await fetchAndTypeEmails({
        host: "imap.ukr.net",
        port: 993,
        user: env.IMAP_USER,
        pass: env.IMAP_PASS,
        fromEmails: ["e.court@cabinet.court.gov.ua", "e.court@court.gov.ua"],
        since,
    }).catch((err) => {
        console.error("[decisions] Error fetching emails:", err);
        return [];
    });

    const decisions = typedEmails.filter((e) => e.type === "decision");

    const caseNumbers = [...new Set(decisions.map((d) => d.caseNumber))];
    const dbCases =
        caseNumbers.length > 0
            ? await db.query.cases.findMany({
                  where: inArray(cases.caseNumber, caseNumbers),
                  columns: { caseNumber: true, plaintiffName: true },
              })
            : [];
    const plaintiffByCase = Object.fromEntries(dbCases.map((c) => [c.caseNumber, c.plaintiffName]));

    function extractCourtName(content: string): string {
        const parts = content.split("від");
        return parts[parts.length - 1]?.trim() ?? "";
    }

    const rows = decisions.map((d) => ({
        caseNumber: d.caseNumber,
        plaintiffName: plaintiffByCase[d.caseNumber] ?? "",
        courtName: extractCourtName(d.content),
        documentLink: d.content.match(/\[(https?:\/\/[^\]]+)\]/)?.[1] ?? "",
        date: d.date.toISOString(),
        type: d.type,
    }));

    const csv = jsonToCsv(rows);

    const filename = `decisions-from-${since.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
