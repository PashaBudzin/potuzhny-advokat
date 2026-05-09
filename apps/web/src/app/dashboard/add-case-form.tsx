"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { extractCourtData, normalizeAddress } from "@/lib/string";
import { useMutation } from "@tanstack/react-query";

export function AddCaseForm() {
    const trpc = useTRPC();
    const [isOpen, setIsOpen] = useState(false);

    const updateMutation = useMutation(trpc.cases.updateCaseMetadata.mutationOptions());

    const form = useForm({
        defaultValues: {
            caseNumber: "",
            courtName: "",
            judgeName: "",
            plaintiffName: "",
            plaintiffCode: "",
            plaintiffAddress: "",
            defendantName: "",
            defendantCode: "",
            defendantAddress: "",
        },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync({
                caseNumber: value.caseNumber,
                data: {
                    courtName: value.courtName || null,
                    judgeName: value.judgeName || null,
                    plaintiffName: value.plaintiffName || null,
                    plaintiffCode: value.plaintiffCode || null,
                    plaintiffAddress: value.plaintiffAddress || null,
                    defendantName: value.defendantName || null,
                    defendantCode: value.defendantCode || null,
                    defendantAddress: value.defendantAddress || null,
                },
            });
            form.reset();
            setIsOpen(false);
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fr = new FileReader();
        fr.onload = (event) => {
            const text = event.target?.result?.toString() ?? "";
            const data = extractCourtData(text);
            form.setFieldValue("caseNumber", data.caseNumber);
            form.setFieldValue("courtName", data.courtName);
            form.setFieldValue("judgeName", data.judgeName);
            form.setFieldValue("plaintiffName", data.plaintiffName);
            form.setFieldValue("plaintiffCode", data.plaintiffCode);
            form.setFieldValue("plaintiffAddress", normalizeAddress(data.plaintiffAddress) || "");
            form.setFieldValue("defendantName", data.defendantName);
            form.setFieldValue("defendantCode", data.defendantCode);
            form.setFieldValue("defendantAddress", normalizeAddress(data.defendantAddress) || "");
        };
        fr.readAsText(file);
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="mb-4">
                    {isOpen ? (
                        <ChevronUp className="mr-2 h-4 w-4" />
                    ) : (
                        <ChevronDown className="mr-2 h-4 w-4" />
                    )}
                    {isOpen ? "Згорнути" : "Додати справу"}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="mb-4 rounded-lg border bg-card p-4"
                >
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">
                            Завантажити HTML (з суду)
                        </label>
                        <Input type="file" accept=".html" onChange={handleFileUpload} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Номер справи
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="caseNumber"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Номер справи"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Суд</label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="courtName"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Суд"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Суддя
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="judgeName"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Суддя"
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-2 border-t pt-2">
                            <span className="text-sm font-medium">Позивач</span>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">ПІБ</label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="plaintiffName"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="ПІБ позивача"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                РНОКПП
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="plaintiffCode"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="РНОКПП"
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Адреса
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="plaintiffAddress"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Адреса позивача"
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-2 border-t pt-2">
                            <span className="text-sm font-medium">Відповідач</span>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">ПІБ</label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="defendantName"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="ПІБ відповідача"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                                РНОКПП
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="defendantCode"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="РНОКПП"
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="mb-1 block text-xs text-muted-foreground">
                                Адреса
                            </label>
                            {/* eslint-disable no-children-prop */}
                            <form.Field
                                name="defendantAddress"
                                children={(field) => (
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        placeholder="Адреса відповідача"
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="mt-4"
                        disabled={!form.state.values.caseNumber || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Збереження..." : "Зберегти"}
                    </Button>
                </form>
            </CollapsibleContent>
        </Collapsible>
    );
}
