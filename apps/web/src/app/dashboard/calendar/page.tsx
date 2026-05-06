import CalendarClient from "./calendar-client";
import { trpc, prefetch, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    void prefetch(trpc.cases.getCasesWithHearings.queryOptions());

    return (
        <HydrateClient>
            <CalendarClient />
        </HydrateClient>
    );
}
