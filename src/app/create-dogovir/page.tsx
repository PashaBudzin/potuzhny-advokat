"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { generateDocx } from "@/lib/docsUtils";
import saveAs from "file-saver";

export default function CreateDogovirRoute() {
  return (
    <div className="min-h-screen bg-background p-8 mt-32">
      <div className="max-w-2xl mx-auto pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Створити Договори</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (s) => {
                s.preventDefault();
                const formData = new FormData(s.currentTarget);

                const templateDogRArrayBuffer = await fetchTemplateArrayBuffer(
                  templates["dogovirR"].templateUrl,
                );
                const templateDogFArrayBuffer = await fetchTemplateArrayBuffer(
                  templates["dogovirF"].templateUrl,
                );

                const fdata = Object.fromEntries(formData.entries());

                const data = {
                  ...fdata,
                  дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
                };

                const dogRFile = generateDocx(templateDogRArrayBuffer, data);
                const dogFFile = generateDocx(templateDogFArrayBuffer, data);

                saveAs(
                  dogRFile,
                  `договір ${(fdata["ПІБ"] as string).split(" ").at(0)}.docx`,
                );

                saveAs(
                  dogFFile,
                  `договір ФОП ${(fdata["ПІБ"] as string).split(" ").at(0)}.docx`,
                );
              }}
            >
              <div className="space-y-2 mt-4">
                <Label htmlFor="ПІБ">ПІБ</Label>
                <Input
                  type="text"
                  name={"ПІБ"}
                  placeholder="Прізвище Ім'я ПоБатькові"
                  required
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="орган_видачі">Орган Видачі</Label>
                <Input
                  type="text"
                  name={"орган_видачі"}
                  placeholder="Найменування органу"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="орган_видачі">Номер Паспорту</Label>
                <Input
                  type="text"
                  name={"номер_паспорту"}
                  placeholder="123456789"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="адреса_реєстрації">Адреса Реєстрації</Label>
                <Input
                  type="text"
                  name={"адреса_реєстрації"}
                  placeholder="вул. Хрещатик, 1, кв. 1"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="дата_народження">Дата Народження</Label>
                <Input
                  type="text"
                  name={"дата_народження"}
                  placeholder="ДД.ММ.РРРР"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="дата_видачі">Дата Видачі</Label>
                <Input
                  type="text"
                  name={"дата_видачі"}
                  placeholder="ДД.ММ.РРРР"
                />
              </div>

              <Button className="w-full mt-4" size="lg" type="submit">
                Generate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
