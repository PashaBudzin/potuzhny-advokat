"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { useCallback, useState } from "react";
import { generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { JsonPreview } from "@/components/json-preview";
import { firstBetween, initials } from "@/lib/string";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { toGenitive } from "@/lib/case";

type ParsedData = {
  суд: string;
  ініціали_судді: string;
  номер_справи: string;
  ПІБ_позивача: string;
  ПІБ_позивача_РВ: string;
  адреса_позивача: string;
  РНОКПП: string;
  суд_ОВ: string;
  ПІБ_відповідача: string;
  ПІБ_відповідача_РВ: string;
  ініціали_позивача: string;
  адреса_відповідача: string;
};

export default function TemplateFillerRoute() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const [generatePoz, setGeneratePoz] = useState(true);
  const [generateVid, setGenerateVid] = useState(false);

  const onSubmit = useCallback(async () => {
    if (!parsedData) return;

    const templateBezV = await fetchTemplateArrayBuffer(
      templates["bezUchastiV"].templateUrl,
    );

    const templateBezP = await fetchTemplateArrayBuffer(
      templates["bezUchastiP"].templateUrl,
    );

    if (generateVid) {
      saveAs(
        generateDocx(templateBezV, {
          ...parsedData,
          дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
        }),
        `заява без участі відповідача ${parsedData.ПІБ_відповідача}.docx`,
      );
    }

    if (generatePoz) {
      saveAs(
        generateDocx(templateBezP, {
          ...parsedData,
          дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
        }),
        `заява без участі позивача ${parsedData.ПІБ_позивача}.docx`,
      );
    }
  }, [generatePoz, generateVid, parsedData]);

  return (
    <div className="min-h-screen bg-background p-8 mt-32">
      <div className="max-w-2xl mx-auto pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Створити заяву без участі</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  const fr = new FileReader();
                  fr.onload = async (e) => {
                    setParsedData(
                      await parseText(e?.target?.result?.toString() ?? ""),
                    );
                  };

                  fr.readAsText(file);
                }}
              />
            </div>

            <div className="space-y-6 mt-4">
              <Field orientation={"horizontal"}>
                <Checkbox
                  onCheckedChange={() => setGenerateVid(!generateVid)}
                  checked={generateVid}
                />
                <FieldLabel>Без участі відповідача</FieldLabel>
              </Field>

              <Field orientation={"horizontal"}>
                <Checkbox
                  onCheckedChange={() => setGeneratePoz(!generatePoz)}
                  checked={generatePoz}
                />
                <FieldLabel>Без участі позивача</FieldLabel>
              </Field>
            </div>
            <div className="space-y-6 mt-4">
              {parsedData && (
                <JsonPreview onChange={setParsedData} data={parsedData} />
              )}
            </div>
            <Button onClick={onSubmit} type="button" className="w-full mt-4">
              Згенерувати
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function parseText(text: string): Promise<ParsedData> {
  const judge = firstBetween(text, '"JUDGENAME1" content="', '">') ?? "";
  const def =
    firstBetween(text, '<meta name="MEMBNAME2" content="', '">') ?? "";

  const poz =
    firstBetween(text, '<meta name="MEMBNAME1" content="', '">') ?? "";

  return {
    суд: firstBetween(text, '"COURTNAME" content="', '">') ?? "",
    ПІБ_позивача: poz,
    ПІБ_позивача_РВ: (await toGenitive(poz)) ?? "",
    адреса_позивача:
      firstBetween(text, '<meta name="MEMBPOSTADDRESS1" content="', '">') ?? "",
    РНОКПП: firstBetween(text, '"MEMBOKPO1" content="', '"') ?? "",
    суд_ОВ: firstBetween(text, "суддя ", judge.split(" ")?.at(0) ?? "") ?? "",
    номер_справи: firstBetween(text, 'name="CAUSENUM" content="', '">') ?? "",
    ПІБ_відповідача: def,
    ПІБ_відповідача_РВ: (await toGenitive(def)) ?? "",
    ініціали_позивача: initials(def),
    адреса_відповідача:
      firstBetween(text, '<meta name="MEMBPOSTADDRESS2" content="', '">') ?? "",
    ініціали_судді: judge,
  };
}
