"use client";

import { useState } from "react";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { toGenitive } from "@/lib/actions/grammatical-cases";
import { firstBetween, initials } from "@/lib/string";

export interface DocumentCaseData {
    caseNumber: string;
    courtName: string | null;
    judgeName: string | null;
    plaintiffName: string | null;
    plaintiffCode: string | null;
    plaintiffAddress: string | null;
    defendantName: string | null;
    defendantCode: string | null;
    defendantAddress: string | null;
}

export function useDocumentGenerator() {
    const [generatePoz, setGeneratePoz] = useState(true);
    const [generateVid, setGenerateVid] = useState(false);
    const [generatingCase, setGeneratingCase] = useState<string | null>(null);
    const [courtGenitive, setCourtGenitive] = useState("");

    const generateDocuments = async (c: DocumentCaseData) => {
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

            const parsedData = {
                суд: c.courtName,
                ініціали_судді: judge,
                номер_справи: c.caseNumber,
                ПІБ_позивача: c.plaintiffName,
                ПІБ_позивача_РВ: (await toGenitive(c.plaintiffName)) ?? "",
                адреса_позивача: c.plaintiffAddress ?? "",
                РНОКПП: c.plaintiffCode ?? "",
                суд_ОВ: courtGenitive || courtOV || "",
                ПІБ_відповідача: c.defendantName,
                ПІБ_відповідача_РВ: (await toGenitive(c.defendantName)) ?? "",
                ініціали_відповідача: initials(c.defendantName),
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

    return {
        generatePoz,
        setGeneratePoz,
        generateVid,
        setGenerateVid,
        generatingCase,
        courtGenitive,
        setCourtGenitive,
        generateDocuments,
    };
}
