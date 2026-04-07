"use client";

import * as React from "react";
import { type Locale } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Hearing {
  caseNumber: string;
  nextCourtHearing: Date | null;
  plaintiffName: string | null;
  defendantName: string | null;
  courtName: string | null;
}

export default function CalendarClient({ hearings }: { hearings: Hearing[] }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const hearingsOnDate = React.useMemo(() => {
    if (!selectedDate) return [];
    return hearings.filter((h) => {
      if (!h.nextCourtHearing) return false;
      const hearingDate = new Date(h.nextCourtHearing);
      return (
        hearingDate.getDate() === selectedDate.getDate() &&
        hearingDate.getMonth() === selectedDate.getMonth() &&
        hearingDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [hearings, selectedDate]);

  const dateHasHearing = (date: Date) => {
    return hearings.some((h) => {
      if (!h.nextCourtHearing) return false;
      const hearingDate = new Date(h.nextCourtHearing);
      return (
        hearingDate.getDate() === date.getDate() &&
        hearingDate.getMonth() === date.getMonth() &&
        hearingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const mode = "single" as const;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Календарь судових засідань</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="w-fit">
          <CardContent className="p-4">
            <Calendar
              mode={mode}
              selected={selectedDate}
              onSelect={setSelectedDate}
              weekStartsOn={1}
              modifiers={{
                hasHearing: (date) => dateHasHearing(date),
              }}
              modifiersStyles={{
                hasHearing: {
                  fontWeight: "bold",
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                  borderRadius: "var(--radius)",
                },
              }}
              locale={{ code: "uk-UA" } as Locale}
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Засідання ${selectedDate.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}`
                : "Оберіть дату"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hearingsOnDate.length === 0 ? (
              <p className="text-muted-foreground">Немає запланованих засідань на цю дату</p>
            ) : (
              <div className="space-y-3">
                {hearingsOnDate.map((hearing) => {
                  const time = hearing.nextCourtHearing
                    ? new Date(hearing.nextCourtHearing).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <div key={hearing.caseNumber} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium">{hearing.caseNumber}</span>
                        <span className="text-sm font-medium">{time}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {hearing.plaintiffName} vs {hearing.defendantName}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{hearing.courtName}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
