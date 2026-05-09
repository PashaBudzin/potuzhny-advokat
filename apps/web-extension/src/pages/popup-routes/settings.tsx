import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { ArrowLeft, CircleX, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hashPassBrowser } from "@potuzhny-advokat/auth-crypto";

interface SettingsPageProps {
    onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );
    const [savedPassword, setSavedPassword] = useState("");

    useEffect(() => {
        browser.storage.local.get("passwordHash").then((result) => {
            if (result.passwordHash) {
                setSavedPassword(result.passwordHash);
            }
        });
    }, []);

    const handleSave = async () => {
        if (!password.trim()) {
            setMessage({ type: "error", text: "Введіть пароль" });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const hashed = await hashPassBrowser(password);
            await browser.storage.local.set({ passwordHash: hashed });
            setSavedPassword(hashed);
            setPassword("");
            setMessage({ type: "success", text: "Пароль збережено" });
        } catch {
            setMessage({ type: "error", text: "Помилка збереження" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = async () => {
        await browser.storage.local.remove("passwordHash");
        setSavedPassword("");
        setMessage({ type: "success", text: "Пароль видалено" });
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-heading text-lg">Налаштування</h2>
            </div>

            {message && (
                <div
                    className={`mb-4 rounded border p-2 text-sm ${
                        message.type === "success"
                            ? "border-green-500 bg-green-500/10 text-green-500"
                            : "border-destructive bg-destructive/10 text-destructive"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Пароль</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введіть пароль"
                        className="w-full rounded border px-2 py-1 pr-10 text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !password.trim()}>
                    {isSaving ? "Збереження..." : "Зберегти"}
                </Button>
                {savedPassword && (
                    <Button variant="outline" onClick={handleClear}>
                        <CircleX />
                    </Button>
                )}
            </div>

            {savedPassword && (
                <p className="mt-4 text-xs text-muted-foreground">Пароль встановлено</p>
            )}
        </div>
    );
}
