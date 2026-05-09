"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DocumentGenerator } from "@/components/document-generator";
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

interface HearingCardProps {
    hearing: Hearing;
    isExpanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
}

export function HearingCard({ hearing, isExpanded, onExpandedChange }: HearingCardProps) {
    const time = hearing.nextCourtHearing
        ? new Date(hearing.nextCourtHearing).toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <Collapsible open={isExpanded} onOpenChange={onExpandedChange}>
            <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
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
                {hearing.judgeName && (
                    <div className="mt-1 text-xs text-muted-foreground">{hearing.judgeName}</div>
                )}
                <CollapsibleContent>
                    <div className="mt-3 border-t pt-3">
                        <DocumentGenerator
                            caseData={{
                                caseNumber: hearing.caseNumber,
                                courtName: hearing.courtName,
                                judgeName: hearing.judgeName,
                                plaintiffName: hearing.plaintiffName,
                                plaintiffCode: hearing.plaintiffCode,
                                plaintiffAddress: hearing.plaintiffAddress,
                                defendantName: hearing.defendantName,
                                defendantCode: hearing.defendantCode,
                                defendantAddress: hearing.defendantAddress,
                            }}
                        />
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
