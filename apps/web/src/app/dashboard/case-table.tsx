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
            <table className="min-w-full divide-y border">
                <thead className="bg-muted">
                    <tr>
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Case #
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">State</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Plaintiff
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Defendant
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">Court</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">Judge</th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Reg. Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase">
                            Last Updated
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
                        {pending ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
            {cases.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No cases found</p>
            )}
        </>
    );
}
