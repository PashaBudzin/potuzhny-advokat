"use client";

import * as React from "react";
import { type Locale } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { toGenitive } from "@/lib/case";
import { firstBetween, initials } from "@/lib/string";
import { getCourtGenetative } from "@/lib/actions/cases";
import { getCourtEmail } from "@/lib/courts";

interface Hearing {
  caseNumber: string;
  nextCourtHearing: Date | null;
  plaintiffName: string | null;
  plaintiffAddress: string | null;
  plaintiffCode: string | null;
  defendantName: string | null;
  defendantAddress: string | null;
  defendantCode: string | null;
  courtName: string | null;
  judgeName: string | null;
}

export default function CalendarClient({ hearings }: { hearings: Hearing[] }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [generatePoz, setGeneratePoz] = React.useState(true);
  const [generateVid, setGenerateVid] = React.useState(false);
  const [generatingCase, setGeneratingCase] = React.useState<string | null>(null);
  const [courtGenitive, setCourtGenitive] = React.useState<Record<string, string>>({});
  const [expandedHearings, setExpandedHearings] = React.useState<Set<string>>(new Set());

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

  const generateDocuments = async (h: Hearing) => {
    if (!h.courtName || !h.judgeName || !h.plaintiffName || !h.defendantName) {
      alert("Недостатньо даних для генерації документів");
      return;
    }

    setGeneratingCase(h.caseNumber);

    try {
      const [templateBezV, templateBezP] = await Promise.all([
        fetchTemplateArrayBuffer(templates["bezUchastiV"].templateUrl),
        fetchTemplateArrayBuffer(templates["bezUchastiP"].templateUrl),
      ]);

      const judge = h.judgeName;
      const courtOV = firstBetween(h.courtName, "суддя ", judge.split(" ").at(0) ?? "") ?? "";
      const courtGen = courtGenitive[h.caseNumber] ?? "";

      const parsedData = {
        суд: h.courtName,
        ініціали_судді: judge,
        номер_справи: h.caseNumber,
        ПІБ_позивача: h.plaintiffName,
        ПІБ_позивача_РВ: (await toGenitive(h.plaintiffName)) ?? "",
        адреса_позивача: h.plaintiffAddress ?? "",
        РНОКПП: h.plaintiffCode ?? "",
        суд_ОВ: courtGen || courtOV || "",
        ПІБ_відповідача: h.defendantName,
        ПІБ_відповідача_РВ: (await toGenitive(h.defendantName)) ?? "",
        ініціали_позивача: initials(h.plaintiffName),
        адреса_відповідача: h.defendantAddress ?? "",
      };

      const dataWithDate = {
        ...parsedData,
        дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
      };

      if (generateVid) {
        saveAs(
          generateDocx(templateBezV, dataWithDate),
          `заява без участі відповідача ${h.defendantName}.docx`,
        );
      }

      if (generatePoz) {
        saveAs(
          generateDocx(templateBezP, dataWithDate),
          `заява без участі позивача ${h.plaintiffName}.docx`,
        );
      }
    } catch (error) {
      console.error("Error generating documents:", error);
      alert("Помилка при генерації документів");
    } finally {
      setGeneratingCase(null);
    }
  };

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
                  const isExpanded = expandedHearings.has(hearing.caseNumber);
                  return (
                    <Collapsible
                      key={hearing.caseNumber}
                      open={isExpanded}
                      onOpenChange={(open) => {
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
                    >
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                          <span className="font-mono font-medium">{hearing.caseNumber}</span>
                          <span className="text-sm font-medium">{time}</span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {hearing.plaintiffName} vs {hearing.defendantName}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{hearing.courtName}</div>
                        {getCourtEmail(hearing.courtName) && (
                          <div className="text-xs text-muted-foreground">
                            {getCourtEmail(hearing.courtName)}
                          </div>
                        )}
                        <CollapsibleContent>
                          <div className="mt-3 border-t pt-3">
                            <div className="mb-2 flex flex-col gap-1">
                              <Field orientation={"horizontal"}>
                                <Checkbox
                                  checked={generatePoz}
                                  onCheckedChange={() => setGeneratePoz(!generatePoz)}
                                />
                                <FieldLabel>Без участі позивача</FieldLabel>
                              </Field>
                              <Field orientation={"horizontal"}>
                                <Checkbox
                                  checked={generateVid}
                                  onCheckedChange={() => setGenerateVid(!generateVid)}
                                />
                                <FieldLabel>Без участі відповідача</FieldLabel>
                              </Field>
                            </div>
                            <div className="mb-2">
                              <label className="mb-1 block text-xs text-muted-foreground">Суд (родовий відмінок)</label>
                              <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!hearing.courtName) return;
                                const gen = await getCourtGenetative(hearing.courtName);
                                setCourtGenitive((prev) => ({
                                  ...prev,
                                  [hearing.caseNumber]: gen,
                                }));
                              }}
                            >
                              AI
                            </Button>
                                <Input
                                  value={courtGenitive[hearing.caseNumber] ?? ""}
                                  onChange={(e) =>
                                    setCourtGenitive((prev) => ({
                                      ...prev,
                                      [hearing.caseNumber]: e.target.value,
                                    }))
                                  }
                                  placeholder="суддя Олександрійському..."
                                />
                              </div>
                            </div>
                            <Button
                              onClick={() => generateDocuments(hearing)}
                              disabled={generatingCase === hearing.caseNumber}
                              className="w-full"
                            >
                              {generatingCase === hearing.caseNumber ? "Генерація..." : "Згенерувати"}
                            </Button>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {generatingCase === hearing.caseNumber ? "Генерація..." : "Готово до генерації"}
                          </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
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
