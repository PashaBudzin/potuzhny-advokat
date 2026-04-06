"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { getCases, getCasesCount, type SortField, type SortOrder, type CaseState } from "@/lib/actions/cases";
import { updateCaseMetadata } from "@/lib/actions/case-metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { Case } from "@/lib/accounting/db/schema";
import { normalizeAddress, firstBetween, initials } from "@/lib/string";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { toGenitive } from "@/lib/case";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

function SortIcon({ field, current }: { field: SortField; current: { field: SortField; order: SortOrder } }) {
  if (current.field !== field) return null;
  return <span className="ml-1">{current.order === "desc" ? "↓" : "↑"}</span>;
}

const stateOptions: { value: CaseState | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "registration", label: "Registration" },
  { value: "ruling", label: "Ruling" },
  { value: "decision", label: "Decision" },
];

function extractCourt(text: string): string {
  return firstBetween(text, '"COURTNAME" content="', '">') ?? "";
}

function extractJudge(text: string): string {
  return firstBetween(text, '"JUDGENAME1" content="', '">') ?? "";
}

function extractCaseNumber(text: string): string {
  return firstBetween(text, 'name="CAUSENUM" content="', '">') ?? "";
}

function extractMeta(text: string, name: string): string {
  return firstBetween(text, `<meta name="${name}" content="`, '"') ?? "";
}

function extractCaseCourt(text: string): string {
  const judge = firstBetween(text, '"JUDGENAME1" content="', '">') ?? "";
  return firstBetween(text, "суддя ", judge.split(" ").at(0) ?? "") ?? "";
}

export default function DashboardClient({
  initialCases,
  totalCount,
}: {
  initialCases: Case[];
  totalCount: number;
}) {
  const [cases, setCases] = useState(initialCases);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: "lastUpdated",
    order: "desc",
  });
  const [state, setState] = useState<CaseState | "">("");
  const [search, setSearch] = useState("");
  const [filteredCount, setFilteredCount] = useState(totalCount);
  const [pending, startTransition] = useTransition();
  const limit = 50;

  const [isOpen, setIsOpen] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [courtName, setCourtName] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [plaintiffName, setPlaintiffName] = useState("");
  const [plaintiffCode, setPlaintiffCode] = useState("");
  const [plaintiffAddress, setPlaintiffAddress] = useState("");
  const [defendantName, setDefendantName] = useState("");
  const [defendantCode, setDefendantCode] = useState("");
  const [defendantAddress, setDefendantAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const [generatePoz, setGeneratePoz] = useState(true);
  const [generateVid, setGenerateVid] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [generatingCase, setGeneratingCase] = useState<string | null>(null);
  const [courtGenitive, setCourtGenitive] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fr = new FileReader();
    fr.onload = (event) => {
      const text = event.target?.result?.toString() ?? "";
      setCaseNumber(extractCaseNumber(text));
      setCourtName(extractCourt(text));
      setJudgeName(extractJudge(text));
      setPlaintiffName(extractMeta(text, "MEMBNAME1") || "");
      setPlaintiffCode(extractMeta(text, "MEMBOKPO1") || "");
      setPlaintiffAddress(normalizeAddress(extractMeta(text, "MEMBPOSTADDRESS1")) || "");
      setDefendantName(extractMeta(text, "MEMBNAME2") || "");
      setDefendantCode(extractMeta(text, "MEMBOKPO2") || "");
      setDefendantAddress(normalizeAddress(extractMeta(text, "MEMBPOSTADDRESS2")) || "");
    };
    fr.readAsText(file);
  };

  const handleSave = async () => {
    if (!caseNumber) return;
    setSaving(true);
    await updateCaseMetadata(caseNumber, {
      courtName: courtName || null,
      judgeName: judgeName || null,
      plaintiffName: plaintiffName || null,
      plaintiffCode: plaintiffCode || null,
      plaintiffAddress: plaintiffAddress || null,
      defendantName: defendantName || null,
      defendantCode: defendantCode || null,
      defendantAddress: defendantAddress || null,
    });
    setSaving(false);
    setCaseNumber("");
    setCourtName("");
    setJudgeName("");
    setPlaintiffName("");
    setPlaintiffCode("");
    setPlaintiffAddress("");
    setDefendantName("");
    setDefendantCode("");
    setDefendantAddress("");
    setIsOpen(false);
  };

  const handleSort = (field: SortField) => {
    const newOrder = sort.field === field && sort.order === "desc" ? "asc" : "desc";
    setSort({ field, order: newOrder });
    setOffset(0);
    startTransition(async () => {
      const newCases = await getCases(0, limit, field, newOrder, state || null, search || null);
      setCases(newCases);
    });
  };

  const handleStateChange = (newState: CaseState | "") => {
    setState(newState);
    setOffset(0);
    startTransition(async () => {
      const [newCases, count] = await Promise.all([
        getCases(0, limit, sort.field, sort.order, newState || null, search || null),
        getCasesCount(newState || null, search || null),
      ]);
      setCases(newCases);
      setFilteredCount(count);
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setOffset(0);
    startTransition(async () => {
      const [newCases, count] = await Promise.all([
        getCases(0, limit, sort.field, sort.order, state || null, value || null),
        getCasesCount(state || null, value || null),
      ]);
      setCases(newCases);
      setFilteredCount(count);
    });
  };

  const loadMore = () => {
    startTransition(async () => {
      const newCases = await getCases(offset + limit, limit, sort.field, sort.order, state || null, search || null);
      setCases((prev) => [...prev, ...newCases]);
      setOffset((prev) => prev + limit);
    });
  };

  const toggleRow = (caseNumber: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseNumber)) {
        newSet.delete(caseNumber);
      } else {
        newSet.add(caseNumber);
      }
      return newSet;
    });
  };

  const generateDocuments = async (c: Case) => {
    if (!c.courtName || !c.judgeName || !c.plaintiffName || !c.defendantName) {
      alert("Недостатньо даних для генерації документів");
      return;
    }

    setGeneratingCase(c.caseNumber);

    try {
      const [templateBezV, templateBezP] = await Promise.all([
        fetchTemplateArrayBuffer(templates["bezUchastiV"].templateUrl),
        fetchTemplateArrayBuffer(templates["bezUchastiP"].templateUrl),
      ]);

      const judge = c.judgeName;
      const courtOV = firstBetween(c.courtName, "суддя ", judge.split(" ").at(0) ?? "") ?? "";
      const courtGen = courtGenitive[c.caseNumber] ?? "";

      const parsedData = {
        суд: c.courtName,
        ініціали_судді: judge,
        номер_справи: c.caseNumber,
        ПІБ_позивача: c.plaintiffName,
        ПІБ_позивача_РВ: (await toGenitive(c.plaintiffName)) ?? "",
        адреса_позивача: c.plaintiffAddress ?? "",
        РНОКПП: c.plaintiffCode ?? "",
        суд_ОВ: courtGen || courtOV || "",
        ПІБ_відповідача: c.defendantName,
        ПІБ_відповідача_РВ: (await toGenitive(c.defendantName)) ?? "",
        ініціали_позивача: initials(c.plaintiffName),
        адреса_відповідача: c.defendantAddress ?? "",
      };

      const dataWithDate = {
        ...parsedData,
        дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
      };

      if (generateVid) {
        saveAs(
          generateDocx(templateBezV, dataWithDate),
          `заява без участі відповідача ${c.defendantName}.docx`,
        );
      }

      if (generatePoz) {
        saveAs(
          generateDocx(templateBezP, dataWithDate),
          `заява без участі позивача ${c.plaintiffName}.docx`,
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="mb-4">
            {isOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {isOpen ? "Згорнути" : "Додати справу"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mb-4 rounded-lg border bg-card p-4">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Завантажити HTML (з суду)</label>
              <Input type="file" accept=".html" onChange={handleFileUpload} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Номер справи</label>
                <Input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="Номер справи" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Суд</label>
                <Input value={courtName} onChange={(e) => setCourtName(e.target.value)} placeholder="Суд" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Суддя</label>
                <Input value={judgeName} onChange={(e) => setJudgeName(e.target.value)} placeholder="Суддя" />
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-sm font-medium">Позивач</span>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">ПІБ</label>
                <Input value={plaintiffName} onChange={(e) => setPlaintiffName(e.target.value)} placeholder="ПІБ позивача" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">РНОКПП</label>
                <Input value={plaintiffCode} onChange={(e) => setPlaintiffCode(e.target.value)} placeholder="РНОКПП" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Адреса</label>
                <Input value={plaintiffAddress} onChange={(e) => setPlaintiffAddress(e.target.value)} placeholder="Адреса позивача" />
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-sm font-medium">Відповідач</span>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">ПІБ</label>
                <Input value={defendantName} onChange={(e) => setDefendantName(e.target.value)} placeholder="ПІБ відповідача" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">РНОКПП</label>
                <Input value={defendantCode} onChange={(e) => setDefendantCode(e.target.value)} placeholder="РНОКПП" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Адреса</label>
                <Input value={defendantAddress} onChange={(e) => setDefendantAddress(e.target.value)} placeholder="Адреса відповідача" />
              </div>
            </div>
            <Button className="mt-4" onClick={handleSave} disabled={saving || !caseNumber}>
              {saving ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-1">
          {stateOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={state === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStateChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <Button
          variant={sort.field === "lastUpdated" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("lastUpdated")}
        >
          Last Updated <SortIcon field="lastUpdated" current={sort} />
        </Button>
        <Button
          variant={sort.field === "registrationDate" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("registrationDate")}
        >
          Reg. Date <SortIcon field="registrationDate" current={sort} />
        </Button>
        <Button
          variant={sort.field === "caseNumber" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("caseNumber")}
        >
          Case # <SortIcon field="caseNumber" current={sort} />
        </Button>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          Total: {filteredCount} cases
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Case #</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">State</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Plaintiff</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Defendant</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Court</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Judge</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Reg. Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y border">
            {cases.map((c) => {
              const isExpanded = expandedRows.has(c.caseNumber);
              return (
                <React.Fragment key={c.caseNumber}>
                  <tr className="hover:bg-muted">
                    <td className="px-3 py-2 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(c.caseNumber)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-sm font-mono">{c.caseNumber}</td>
                    <td className="px-3 py-2 text-sm">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs ${
                          c.state === "decision"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : c.state === "ruling"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {c.state}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">{c.plaintiffName || "-"}</td>
                    <td className="px-3 py-2 text-sm">{c.defendantName || "-"}</td>
                    <td className="px-3 py-2 text-sm">{c.courtName || "-"}</td>
                    <td className="px-3 py-2 text-sm">{c.judgeName || "-"}</td>
                    <td className="px-3 py-2 text-sm">
                      {c.registrationDate ? c.registrationDate.toLocaleDateString("uk-UA") : "-"}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {c.lastUpdated ? c.lastUpdated.toLocaleString("uk-UA") : "-"}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${c.caseNumber}-expanded`}>
                      <td colSpan={9} className="bg-muted/30 px-4 py-4">
                        <div className="rounded-lg border bg-card p-4">
                          <h3 className="mb-3 text-sm font-semibold">Згенерувати документи</h3>
                          <div className="mb-3 flex flex-col gap-2">
                            <Field orientation={"horizontal"}>
                              <Checkbox
                                onCheckedChange={() => setGeneratePoz(!generatePoz)}
                                checked={generatePoz}
                              />
                              <FieldLabel>Без участі позивача</FieldLabel>
                            </Field>
                            <Field orientation={"horizontal"}>
                              <Checkbox
                                onCheckedChange={() => setGenerateVid(!generateVid)}
                                checked={generateVid}
                              />
                              <FieldLabel>Без участі відповідача</FieldLabel>
                            </Field>
                          </div>
                          <div className="mb-3">
                            <label className="mb-1 block text-xs text-muted-foreground">Суд (родовий відмінок)</label>
                            <Input
                              value={courtGenitive[c.caseNumber] ?? ""}
                              onChange={(e) =>
                                setCourtGenitive((prev) => ({
                                  ...prev,
                                  [c.caseNumber]: e.target.value,
                                }))
                              }
                              placeholder="суддя Олександрійському..."
                            />
                          </div>
                          <Button
                            onClick={() => generateDocuments(c)}
                            disabled={
                              generatingCase === c.caseNumber ||
                              (!generatePoz && !generateVid) ||
                              !c.courtName ||
                              !c.judgeName ||
                              !c.plaintiffName ||
                              !c.defendantName
                            }
                          >
                            {generatingCase === c.caseNumber
                              ? "Генерація..."
                              : "Згенерувати"}
                          </Button>
                          <div className="mt-3 text-xs text-muted-foreground">
                            {!c.courtName || !c.judgeName || !c.plaintiffName || !c.defendantName
                              ? "Потрібно заповнити: суд, суддя, ПІБ позивача, ПІБ відповідача"
                              : "Всі дані заповнені"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {cases.length < filteredCount && (
        <div className="mt-4 flex justify-center">
          <Button onClick={loadMore} disabled={pending}>
            {pending ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {cases.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No cases found</p>
      )}
    </div>
  );
}