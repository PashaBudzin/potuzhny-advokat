"use client";

import * as React from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PopoverProvider, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";

export function DecisionsForm() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const [date, setDate] = React.useState<Date>(threeDaysAgo);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const from = date.toISOString().slice(0, 10);
        window.location.href = `/dashboard/decisions/csv?from=${from}`;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Дата початку
                </label>
                <PopoverProvider open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
                        >
                            <HugeiconsIcon icon={Calendar02Icon} className="mr-2 size-4" />
                            {date ? format(date, "dd.MM.yyyy", { locale: uk }) : "Виберіть дату"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                                if (d) {
                                    setDate(d);
                                    setOpen(false);
                                }
                            }}
                            autoFocus
                        />
                    </PopoverContent>
                </PopoverProvider>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Завантаження..." : "Завантажити CSV"}
            </Button>
        </form>
    );
}
