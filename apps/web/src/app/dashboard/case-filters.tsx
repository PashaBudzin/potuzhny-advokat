"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { CaseState } from "@/lib/types/cases";
import type { SortField, SortOrder } from "@/lib/types/cases";

const stateOptions: { value: CaseState | ""; label: string }[] = [
    { value: "", label: "Всі" },
    { value: "registration", label: "Реєстрація" },
    { value: "ruling", label: "Рішення" },
    { value: "decision", label: "Ухвала" },
];

function SortIcon({
    field,
    current,
}: {
    field: SortField;
    current: { field: SortField; order: SortOrder };
}) {
    if (current.field !== field) return null;
    return <span className="ml-1">{current.order === "desc" ? "↓" : "↑"}</span>;
}

interface CaseFiltersProps {
    state: CaseState | "";
    onStateChange: (newState: CaseState | "") => void;
    sort: { field: SortField; order: SortOrder };
    onSort: (field: SortField) => void;
    search: string;
    onSearch: (value: string) => void;
    filteredCount: number;
}

export function CaseFilters({
    state,
    onStateChange,
    sort,
    onSort,
    search,
    onSearch,
    filteredCount,
}: CaseFiltersProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-4">
            <div className="flex flex-wrap gap-1">
                {stateOptions.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={state === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onStateChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
            <div className="flex flex-wrap gap-1">
                <Button
                    variant={sort.field === "lastUpdated" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSort("lastUpdated")}
                >
                    Оновлення <SortIcon field="lastUpdated" current={sort} />
                </Button>
                <Button
                    variant={sort.field === "registrationDate" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSort("registrationDate")}
                >
                    Дата реєстрації <SortIcon field="registrationDate" current={sort} />
                </Button>
                <Button
                    variant={sort.field === "caseNumber" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSort("caseNumber")}
                >
                    Номер справи <SortIcon field="caseNumber" current={sort} />
                </Button>
            </div>
            <div className="relative w-full md:w-auto md:flex-1 md:max-w-[200px]">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-8"
                    placeholder="Пошук..."
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <span className="ml-auto text-sm text-muted-foreground">
                Всього: {filteredCount} справ
            </span>
        </div>
    );
}
