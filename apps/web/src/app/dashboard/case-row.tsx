"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DocumentGenerator } from "@/components/document-generator";
import type { Case } from "@potuzhny-advokat/db";

interface CaseRowProps {
    c: Case;
    isExpanded: boolean;
    onToggle: () => void;
}

export function CaseRow({ c, isExpanded, onToggle }: CaseRowProps) {
    return (
        <React.Fragment>
            <tr className="hover:bg-muted">
                <td className="px-3 py-2 text-sm">
                    <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
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
                        <div className="rounded-lg border bg-card p-4 lg:max-w-[33%]">
                            <h3 className="mb-3 text-sm font-semibold">Згенерувати документи</h3>
                            <DocumentGenerator
                                caseData={{
                                    caseNumber: c.caseNumber,
                                    courtName: c.courtName,
                                    judgeName: c.judgeName,
                                    plaintiffName: c.plaintiffName,
                                    plaintiffCode: c.plaintiffCode,
                                    plaintiffAddress: c.plaintiffAddress,
                                    defendantName: c.defendantName,
                                    defendantCode: c.defendantCode,
                                    defendantAddress: c.defendantAddress,
                                }}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}
