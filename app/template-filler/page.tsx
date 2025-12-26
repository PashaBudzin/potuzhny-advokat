"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchTemplateArrayBuffer,
  templates,
  type Template,
} from "@/lib/templates";
import { useEffect, useState } from "react";
import { extractTags, generateDocx } from "@/lib/docsUtils";
import { saveAs } from "file-saver";
import { intitials } from "@/lib/string";

export default function TemplateFillerRoute() {
  const templateNames = Object.keys(templates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [selectTemplateUpload, setSelectTemplateUpload] = useState(false);

  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedTemplate) return;

    fetchTemplateArrayBuffer(selectedTemplate.templateUrl)
      .then((a) => {
        console.log("ArrayBuffer byte length:", a.byteLength);
        const tags = extractTags(a);

        setFields(tags);
      })
      .catch(console.error);
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-background p-8 mt-32">
      <div className="max-w-2xl mx-auto pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Template Filler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  onValueChange={(v: string | null) => {
                    if (!v) return;
                    if (v == "custom") {
                      setSelectedTemplate(null);
                      setSelectTemplateUpload(true);
                      return;
                    }
                    setSelectTemplateUpload(false);
                    setSelectedTemplate(templates[v]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateNames.map((tn) => (
                      <SelectItem key={tn} value={tn}>
                        {templates[tn].name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {selectTemplateUpload ? (
                  <Input
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedTemplate({
                          name: "Custom Template",
                          templateUrl: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                ) : (
                  <></>
                )}
              </div>

              <form
                onSubmit={async (s) => {
                  s.preventDefault();
                  if (!selectedTemplate) return;
                  const formData = new FormData(s.currentTarget);
                  const fdata: Record<string, string> = {};
                  fields.forEach((field) => {
                    const value = formData.get(field) as string;
                    if (value) {
                      fdata[field] = value;
                    }
                  });

                  const templateArrayBuffer = await fetchTemplateArrayBuffer(
                    selectedTemplate.templateUrl,
                  );

                  console.log(fdata);

                  const data = {
                    ...fdata,
                    дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
                    ініціали: fdata["ПІБ"]
                      ? intitials(fdata["ПІБ"] as string)
                      : undefined,
                  };

                  const file = generateDocx(
                    templateArrayBuffer,
                    data as Record<string, string>,
                  );

                  saveAs(file, `заповнений ${selectedTemplate.name}.docx`);
                }}
              >
                {fields.map((f) => (
                  <div className="space-y-2 mt-4" key={f}>
                    <Label htmlFor={f}>{f}</Label>
                    <Input
                      id={f}
                      type="text"
                      name={f}
                      placeholder={`Введіть ${f.toLowerCase()}`}
                    />
                  </div>
                ))}

                <Button className="w-full mt-4" size="lg" type="submit">
                  Generate
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
