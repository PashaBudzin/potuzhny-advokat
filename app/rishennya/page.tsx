"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { useCallback, useState } from "react";
import { generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { JsonPreview } from "@/components/json-preview";
import { firstBetween, normalizeAddress } from "@/lib/string";
import { toGenitive } from "@/lib/case";

type ParsedData = {
  суд: string;
  ПІБ_позивача: string;
  ПІБ_позивача_рв: string;
  адреса_позивача: string;
  код_позивача: string;
  суд_рв: string;
  дата_рішення: string;
  номер_справи: string;
  ПІБ_відповідача_рв: string;
};

export default function TemplateFillerRoute() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"vydachaRishennya" | "sudovyiNakaz">("vydachaRishennya");

  const onSubmit = useCallback(async () => {
    if (!parsedData) return;

    const templateVydacha = await fetchTemplateArrayBuffer(
      templates[selectedTemplate].templateUrl,
    );

    saveAs(
      generateDocx(templateVydacha, {
        ...parsedData,
        дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
      }),
      `заява про видачу ${selectedTemplate === "vydachaRishennya" ? "копії рішення" : "судового наказу"} ${parsedData.ПІБ_позивача}.docx`,
    );
  }, [parsedData, selectedTemplate]);

  return (
    <div className="min-h-screen bg-background p-8 mt-32">
      <div className="max-w-2xl mx-auto pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Копія рішення/судовий наказ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <RadioGroup
                value={selectedTemplate}
                onValueChange={(value) =>
                  setSelectedTemplate(value as "vydachaRishennya" | "sudovyiNakaz")
                }
                className="flex gap-4"
              >
                <Field orientation="horizontal">
                  <RadioGroupItem value="vydachaRishennya" id="vydachaRishennya" />
                  <FieldLabel htmlFor="vydachaRishennya" className="font-normal">
                    копія про видачу рішення
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="sudovyiNakaz" id="sudovyiNakaz" />
                  <FieldLabel htmlFor="sudovyiNakaz" className="font-normal">
                    судовий наказ
                  </FieldLabel>
                </Field>
              </RadioGroup>
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
  const poz =
    firstBetween(text, '<meta name="MEMBNAME1" content="', '">') ?? "";
  const def =
    firstBetween(text, '<meta name="MEMBNAME2" content="', '">') ?? "";

  return {
    суд: firstBetween(text, '"COURTNAME" content="', '">') ?? "",
    ПІБ_позивача: poz,
    ПІБ_позивача_рв: (await toGenitive(poz)) ?? "",
    адреса_позивача:
      normalizeAddress(firstBetween(text, '<meta name="MEMBPOSTADDRESS1" content="', '">')) ?? "",
    код_позивача: firstBetween(text, '"MEMBOKPO1" content="', '"') ?? "",
    суд_рв: firstBetween(text, "року до ", "надійшла") ?? "",
    дата_рішення: firstBetween(text, '"DOCDATE" content="', '">') ?? "",
    номер_справи: firstBetween(text, 'name="CAUSENUM" content="', '">') ?? "",
    ПІБ_відповідача_рв: (await toGenitive(def)) ?? "",
  };
}
