"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { useDocumentGenerator, type DocumentCaseData } from "@/lib/hooks/use-document-generator";
import { getCourtGenetative } from "@/lib/actions/grammatical-cases";

export function DocumentGenerator({
    caseData,
    className,
}: {
    caseData: DocumentCaseData;
    className?: string;
}) {
    const {
        generatePoz,
        setGeneratePoz,
        generateVid,
        setGenerateVid,
        generatingCase,
        courtGenitive,
        setCourtGenitive,
        generateDocuments,
    } = useDocumentGenerator();

    return (
        <div className={className}>
            <div className="mb-3 flex flex-col gap-2">
                <Field orientation="horizontal">
                    <Checkbox
                        checked={generatePoz}
                        onCheckedChange={() => setGeneratePoz(!generatePoz)}
                    />
                    <FieldLabel>Без участі позивача</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                    <Checkbox
                        checked={generateVid}
                        onCheckedChange={() => setGenerateVid(!generateVid)}
                    />
                    <FieldLabel>Без участі відповідача</FieldLabel>
                </Field>
            </div>
            <div className="mb-3">
                <label className="mb-1 block text-xs text-muted-foreground">
                    Суд (родовий відмінок)
                </label>
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            if (!caseData.courtName) return;
                            try {
                                const gen = await getCourtGenetative(caseData.courtName);
                                setCourtGenitive(gen);
                            } catch (err) {
                                console.error("AI gen error", err);
                                alert("Помилка генерації родового відмінка");
                            }
                        }}
                        disabled={!caseData.courtName}
                    >
                        AI
                    </Button>
                    <Input
                        value={courtGenitive}
                        onChange={(e) => setCourtGenitive(e.target.value)}
                        placeholder="суддя Олександрійському..."
                    />
                </div>
            </div>
            <Button
                onClick={() => generateDocuments(caseData)}
                disabled={
                    generatingCase === caseData.caseNumber ||
                    (!generatePoz && !generateVid) ||
                    !caseData.judgeName ||
                    !caseData.plaintiffName ||
                    !caseData.defendantName ||
                    (!courtGenitive && !caseData.courtName)
                }
            >
                {generatingCase === caseData.caseNumber ? "Генерація..." : "Згенерувати"}
            </Button>
            <div className="mt-3 text-xs text-muted-foreground">
                {!caseData.courtName ||
                !caseData.judgeName ||
                !caseData.plaintiffName ||
                !caseData.defendantName
                    ? "Потрібно заповнити: суд, суддя, ПІБ позивача, ПІБ відповідача"
                    : "Всі дані заповнені"}
            </div>
        </div>
    );
}
