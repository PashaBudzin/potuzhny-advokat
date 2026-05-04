"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchTemplateArrayBuffer, templates } from "@/lib/templates";
import { generateDocx } from "@/lib/docsUtils";
import saveAs from "file-saver";
import { formatNumber } from "@potuzhny-advokat/strings";

const metaOptions = [
    "про розірвання шлюбу",
    "про стягнення аліментів",
    "про розірвання шлюбу та стягнення аліментів",
] as const;

export default function CreateDogovirRoute() {
    const [ціна, setЦіна] = React.useState("5000");
    const [мета, setМета] = React.useState("");

    const ціна_розшифровка = ціна ? formatNumber(Number(ціна)) : "";
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleGenerateDogovirR = async () => {
        if (!formRef.current || !formRef.current.reportValidity()) return;
        const formData = new FormData(formRef.current);
        const fdata = Object.fromEntries(formData.entries());
        const templateArrayBuffer = await fetchTemplateArrayBuffer(
            templates["dogovirR"].templateUrl,
        );
        const data = {
            ...fdata,
            дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
            мета,
            ціна_розшифровка,
        };
        const docFile = generateDocx(templateArrayBuffer, data);
        saveAs(docFile, `договір ${(fdata["ПІБ"] as string).split(" ").at(0)}.docx`);
    };

    const handleGenerateDogovirF = async () => {
        if (!formRef.current || !formRef.current.reportValidity()) return;
        const formData = new FormData(formRef.current);
        const fdata = Object.fromEntries(formData.entries());
        const templateArrayBuffer = await fetchTemplateArrayBuffer(
            templates["dogovirF"].templateUrl,
        );
        const data = {
            ...fdata,
            дата_сьогодні: new Date().toLocaleDateString("uk-UA"),
            мета,
            ціна_розшифровка,
        };
        const docFile = generateDocx(templateArrayBuffer, data);
        saveAs(docFile, `договір ФОП ${(fdata["ПІБ"] as string).split(" ").at(0)}.docx`);
    };

    return (
        <div className="min-h-screen bg-background p-8 mt-32">
            <div className="max-w-2xl mx-auto pt-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Створити Договори</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form ref={formRef}>
                            <input type="hidden" name="ціна_розшифровка" value={ціна_розшифровка} />
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
                                <Input type="text" name={"дата_видачі"} placeholder="ДД.ММ.РРРР" />
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="мета">Мета</Label>
                                <Select value={мета} onValueChange={setМета} required>
                                    <SelectTrigger id="мета" name="мета">
                                        <SelectValue placeholder="Оберіть мету договору" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metaOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="ціна">Ціна</Label>
                                <Input
                                    type="number"
                                    name={"ціна"}
                                    id="ціна"
                                    placeholder="1000"
                                    value={ціна}
                                    onChange={(e) => setЦіна(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Button
                                    size="lg"
                                    type="button"
                                    onClick={handleGenerateDogovirR}
                                    className="flex-1"
                                >
                                    Договір Послуги
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    onClick={handleGenerateDogovirF}
                                    className="flex-1"
                                >
                                    Договір ФОП
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
