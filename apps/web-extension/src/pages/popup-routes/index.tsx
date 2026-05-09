import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { extractCourtData, normalizeAddress } from "@potuzhny-advokat/strings";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

type CourtFormData = {
    caseNumber: string;
    courtName: string;
    judgeName: string;
    plaintiffName: string;
    plaintiffCode: string;
    plaintiffAddress: string;
    defendantName: string;
    defendantCode: string;
    defendantAddress: string;
};

export default function MainPage() {
    const [formData, setFormData] = useState<CourtFormData>({
        caseNumber: "",
        courtName: "",
        judgeName: "",
        plaintiffName: "",
        plaintiffCode: "",
        plaintiffAddress: "",
        defendantName: "",
        defendantCode: "",
        defendantAddress: "",
    });
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation(trpc.cases.updateCaseMetadata.mutationOptions());

    useEffect(() => {
        browser.storage.session.get("blobSource").then((result) => {
            const text = result.blobSource ?? "";
            const data = extractCourtData(text);
            setFormData({
                caseNumber: data.caseNumber,
                courtName: data.courtName,
                judgeName: data.judgeName,
                plaintiffName: data.plaintiffName,
                plaintiffCode: data.plaintiffCode,
                plaintiffAddress: normalizeAddress(data.plaintiffAddress) || "",
                defendantName: data.defendantName,
                defendantCode: data.defendantCode,
                defendantAddress: normalizeAddress(data.defendantAddress) || "",
            });
        });

        const listener = (changes: Record<string, browser.Storage.StorageChange>) => {
            if (changes.blobSource) {
                const text = changes.blobSource.newValue ?? "";
                if (text) {
                    const data = extractCourtData(text);
                    setFormData({
                        caseNumber: data.caseNumber,
                        courtName: data.courtName,
                        judgeName: data.judgeName,
                        plaintiffName: data.plaintiffName,
                        plaintiffCode: data.plaintiffCode,
                        plaintiffAddress: normalizeAddress(data.plaintiffAddress) || "",
                        defendantName: data.defendantName,
                        defendantCode: data.defendantCode,
                        defendantAddress: normalizeAddress(data.defendantAddress) || "",
                    });
                }
            }
        };
        browser.storage.session.onChanged.addListener(listener);
        return () => browser.storage.session.onChanged.removeListener(listener);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        updateMutation
            .mutateAsync({
                caseNumber: formData.caseNumber,
                data: {
                    ...formData,
                },
            })
            .then(() => {
                setFormData({
                    caseNumber: "",
                    courtName: "",
                    judgeName: "",
                    plaintiffName: "",
                    plaintiffCode: "",
                    plaintiffAddress: "",
                    defendantName: "",
                    defendantCode: "",
                    defendantAddress: "",
                });
            })
            .catch((err) => {
                setError(err.message ?? "Something went wrong");
            });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            {error && (
                <div className="mb-4 rounded border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Номер справи</label>
                <input
                    type="text"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Суд</label>
                <input
                    type="text"
                    value={formData.courtName}
                    onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Суддя</label>
                <input
                    type="text"
                    value={formData.judgeName}
                    onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-2 border-t pt-2">
                <span className="text-sm font-medium">Позивач</span>
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">ПІБ</label>
                <input
                    type="text"
                    value={formData.plaintiffName}
                    onChange={(e) => setFormData({ ...formData, plaintiffName: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">РНОКПП</label>
                <input
                    type="text"
                    value={formData.plaintiffCode}
                    onChange={(e) => setFormData({ ...formData, plaintiffCode: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Адреса</label>
                <input
                    type="text"
                    value={formData.plaintiffAddress}
                    onChange={(e) => setFormData({ ...formData, plaintiffAddress: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-2 border-t pt-2">
                <span className="text-sm font-medium">Відповідач</span>
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">ПІБ</label>
                <input
                    type="text"
                    value={formData.defendantName}
                    onChange={(e) => setFormData({ ...formData, defendantName: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">РНОКПП</label>
                <input
                    type="text"
                    value={formData.defendantCode}
                    onChange={(e) => setFormData({ ...formData, defendantCode: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="mb-1 block text-xs font-medium">Адреса</label>
                <input
                    type="text"
                    value={formData.defendantAddress}
                    onChange={(e) => setFormData({ ...formData, defendantAddress: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                />
            </div>
            <button
                type="submit"
                disabled={!formData.caseNumber}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
                Прикріпити
            </button>
        </form>
    );
}
