import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DecisionsForm } from "./decisions-form";

export default function DecisionsPage() {
    return (
        <div className="flex h-full items-center justify-center p-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Рішення суду</CardTitle>
                    <CardDescription>
                        Завантажте CSV з рішеннями суду за вказаний період
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DecisionsForm />
                </CardContent>
            </Card>
        </div>
    );
}
