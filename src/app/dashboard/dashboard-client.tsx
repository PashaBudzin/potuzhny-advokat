"use client";

import { useState, useTransition } from "react";
import { getCases, getCasesCount, type SortField, type SortOrder, type CaseState } from "@/lib/actions/cases";
import { updateCaseMetadata } from "@/lib/actions/case-metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Case } from "@/lib/accounting/db/schema";
import { normalizeAddress, firstBetween } from "@/lib/string";

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

function extractMetaTag(text: string, tag: string): string {
  return firstBetween(text, `"${tag}" content="`, '">') ?? "";
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

  const loadMore = () => {
    startTransition(async () => {
      const newCases = await getCases(offset + limit, limit, sort.field, sort.order, state || null);
      setCases((prev) => [...prev, ...newCases]);
      setOffset((prev) => prev + limit);
    });
  };

  const handleSort = (field: SortField) => {
    const newOrder = sort.field === field && sort.order === "desc" ? "asc" : "desc";
    setSort({ field, order: newOrder });
    setOffset(0);
    startTransition(async () => {
      const newCases = await getCases(0, limit, field, newOrder, state || null);
      setCases(newCases);
    });
  };

  const handleStateChange = (newState: CaseState | "") => {
    setState(newState);
    setOffset(0);
    startTransition(async () => {
      const [newCases, count] = await Promise.all([
        getCases(0, limit, sort.field, sort.order, newState || null),
        getCasesCount(newState || null),
      ]);
      setCases(newCases);
      setFilteredCount(count);
    });
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
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Завантажити HTML (з суду)</label>
              <Input type="file" accept=".html" onChange={handleFileUpload} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Номер справи</label>
                <Input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="Номер справи" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Суд</label>
                <Input value={courtName} onChange={(e) => setCourtName(e.target.value)} placeholder="Суд" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Суддя</label>
                <Input value={judgeName} onChange={(e) => setJudgeName(e.target.value)} placeholder="Суддя" />
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-sm font-medium">Позивач</span>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">ПІБ</label>
                <Input value={plaintiffName} onChange={(e) => setPlaintiffName(e.target.value)} placeholder="ПІБ позивача" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">РНОКПП</label>
                <Input value={plaintiffCode} onChange={(e) => setPlaintiffCode(e.target.value)} placeholder="РНОКПП" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-gray-500">Адреса</label>
                <Input value={plaintiffAddress} onChange={(e) => setPlaintiffAddress(e.target.value)} placeholder="Адреса позивача" />
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-sm font-medium">Відповідач</span>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">ПІБ</label>
                <Input value={defendantName} onChange={(e) => setDefendantName(e.target.value)} placeholder="ПІБ відповідача" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">РНОКПП</label>
                <Input value={defendantCode} onChange={(e) => setDefendantCode(e.target.value)} placeholder="РНОКПП" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-gray-500">Адреса</label>
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
        <span className="ml-auto text-sm text-gray-500">
          Total: {filteredCount} cases
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
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
          <tbody className="divide-y divide-gray-200">
            {cases.map((c) => (
              <tr key={c.caseNumber} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-mono">{c.caseNumber}</td>
                <td className="px-3 py-2 text-sm">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs ${
                      c.state === "decision"
                        ? "bg-green-100 text-green-800"
                        : c.state === "ruling"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
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
            ))}
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
        <p className="py-8 text-center text-gray-500">No cases found</p>
      )}
    </div>
  );
}