import { getCasesWithHearings } from "@/lib/actions/cases";
import CalendarClient from "./calendar-client";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const hearings = await getCasesWithHearings();

  return <CalendarClient hearings={hearings} />;
}
