import { NextResponse } from "next/server";
import { env } from "@/env";
import {
    parseDocType,
    fetchEmails,
    updateCaseStates,
    groupDocsByCase,
    sendTelegramBriefing,
    type DocEmail,
} from "@potuzhny-advokat/accounting";

function getDaysAgo(days: number): Date {
    const now = new Date();
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export const maxDuration = 30;

export async function GET() {
    console.log("[cron] Starting email fetch process");

    if (!env.IMAP_PASS || !env.IMAP_USER) {
        console.error("[cron] IMAP credentials not configured");
        return NextResponse.json(
            {
                message: "error, env isn't configured properly",
            },
            { status: 500 },
        );
    }

    const since = getDaysAgo(3);

    const emails: DocEmail[] = await fetchEmails({
        host: "imap.ukr.net",
        port: 993,
        user: env.IMAP_USER,
        pass: env.IMAP_PASS,
        fromEmails: ["e.court@cabinet.court.gov.ua", "e.court@court.gov.ua"],
        since,
    }).catch((err) => {
        console.error("[cron] Error fetching emails:", err);
        return [];
    });

    console.log("[cron] Parsing document types...");
    const typedEmails = emails
        .map(parseDocType)
        .filter((d): d is NonNullable<typeof d> => d !== null);

    console.log(
        "[cron] Typed",
        typedEmails.length,
        "emails, rejected",
        emails.length - typedEmails.length,
    );

    console.log("[cron] Grouping by case...");
    const cases = groupDocsByCase(typedEmails);

    console.log("[cron] Found", cases.length, "unique cases");

    console.log("[cron] Updating case states in DB...");
    const updates = await updateCaseStates(typedEmails);

    console.log(`[cron] Done:  ${updates.length} updates`);

    console.log("[cron] Sending briefing in telegram");
    await sendTelegramBriefing(updates);

    return NextResponse.json({ message: "ok" });
}
