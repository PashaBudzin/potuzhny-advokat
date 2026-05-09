"use client";

import * as React from "react";
import { type Locale } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { AddCaseForm } from "../add-case-form";
import { HearingCard } from "./hearing-card";

export default function CalendarClient() {
    const trpc = useTRPC();
    const hearingsQuery = useQuery(trpc.cases.getCasesWithHearings.queryOptions());

    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    const [expandedHearings, setExpandedHearings] = React.useState<Set<string>>(new Set());

    const hearingsOnDate = React.useMemo(() => {
        if (!selectedDate) return [];
        return (hearingsQuery.data ?? []).filter((h) => {
            if (!h.nextCourtHearing) return false;
            const hearingDate = new Date(h.nextCourtHearing);
            return (
                hearingDate.getDate() === selectedDate.getDate() &&
                hearingDate.getMonth() === selectedDate.getMonth() &&
                hearingDate.getFullYear() === selectedDate.getFullYear()
            );
        });
    }, [hearingsQuery.data, selectedDate]);

    const dateHasHearing = (date: Date) => {
        return (hearingsQuery.data ?? []).some((h) => {
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
            <h1 className="mb-6 text-2xl font-semibold font-heading">Календар судових засідань</h1>

            <AddCaseForm />

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
                        {hearingsQuery.isLoading ? (
                            <p className="text-muted-foreground">Завантаження...</p>
                        ) : hearingsQuery.isError ? (
                            <div className="text-muted-foreground">
                                <p>
                                    Помилка при завантаженні засідань:{" "}
                                    {String(hearingsQuery.error?.message)}
                                </p>
                                <Button onClick={() => void hearingsQuery.refetch()}>
                                    Повторити
                                </Button>
                            </div>
                        ) : hearingsOnDate.length === 0 ? (
                            <p className="text-muted-foreground">
                                Немає запланованих засідань на цю дату
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {hearingsOnDate.map((hearing) => {
                                    const isExpanded = expandedHearings.has(hearing.caseNumber);
                                    return (
                                        <HearingCard
                                            key={hearing.caseNumber}
                                            hearing={hearing}
                                            isExpanded={isExpanded}
                                            onExpandedChange={(open) => {
                                                setExpandedHearings((prev) => {
                                                    const newSet = new Set(prev);
                                                    if (open) {
                                                        newSet.add(hearing.caseNumber);
                                                    } else {
                                                        newSet.delete(hearing.caseNumber);
                                                    }
                                                    return newSet;
                                                });
                                            }}
                                        />
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
