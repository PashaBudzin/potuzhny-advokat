"use client";

import { Button } from "@/components/ui/button";
import type { Case } from "@potuzhny-advokat/db";
import { CaseRow } from "./case-row";

interface CaseTableProps {
    cases: Case[];
    expandedRows: Set<string>;
    onToggleRow: (caseNumber: string) => void;
}

export function CaseTable({ cases, expandedRows, onToggleRow }: CaseTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-[800px] divide-y border">
                <thead className="bg-muted">
                    <tr>
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">№</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Статус
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Позивач
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Відповідач
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">Суд</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">Суддя</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Дата реєстрації
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Останнє оновлення
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y border">
                    {cases.map((c) => (
                        <CaseRow
                            key={c.caseNumber}
                            c={c}
                            isExpanded={expandedRows.has(c.caseNumber)}
                            onToggle={() => onToggleRow(c.caseNumber)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface CaseTableWithPaginationProps extends CaseTableProps {
    hasMore: boolean;
    onLoadMore: () => void;
    pending: boolean;
}

export function CaseTableWithPagination({
    cases,
    expandedRows,
    onToggleRow,
    hasMore,
    onLoadMore,
    pending,
}: CaseTableWithPaginationProps) {
    return (
        <>
            <CaseTable cases={cases} expandedRows={expandedRows} onToggleRow={onToggleRow} />
            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={onLoadMore} disabled={pending}>
                        {pending ? "Завантаження..." : "Завантажити ще"}
                    </Button>
                </div>
            )}
            {cases.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">Справи не знайдено</p>
            )}
        </>
    );
}
