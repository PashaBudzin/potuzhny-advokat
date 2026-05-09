import DashboardClient from "./dashboard-client";
import { trpc, prefetch, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    void prefetch(
        trpc.cases.getCases.queryOptions({
            offset: 0,
            limit: 50,
            sortField: "lastUpdated",
            sortOrder: "desc",
        }),
    );

    void prefetch(trpc.cases.getCasesCount.queryOptions({}));

    return (
        <HydrateClient>
            <DashboardClient />
        </HydrateClient>
    );
}
