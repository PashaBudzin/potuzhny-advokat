import { getCases, getCasesCount } from "@/lib/actions/cases";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
    const initialCases = await getCases(0, 50, "lastUpdated", "desc");
    const totalCount = await getCasesCount();

    return <DashboardClient initialCases={initialCases} totalCount={totalCount} />;
}
