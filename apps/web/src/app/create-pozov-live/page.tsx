"use client";
// oxlint-disable react/no-array-index-key

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Packer } from "docx";
import { Trash, File as FileIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";

import { FilePreview } from "@/components/file-preview";
import { JsonPreview } from "@/components/json-preview";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import {
    pozovTemplateDataSchema,
    generatePozovText,
    PozovTemplateData,
} from "@/lib/template-pozov-generator";
import { extractPozovTemplateData } from "@/lib/ai";
import { generatePozovDocx } from "@/lib/generatePozovDocx";
import { formatBytes } from "@/lib/string";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type ExtractionStatus = "idle" | "extracting" | "success" | "error";

export default function Page() {
    const [files, setFiles] = useState<File[]>([]);
    const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>("idle");
    const [templateData, setTemplateData] = useState<PozovTemplateData | null>(null);
    const [message, setMessage] = useState("");

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-[1800px] mx-auto">
                <h1 className="text-3xl font-bold mb-6">Створення позову</h1>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_1fr] gap-6">
                    <UploadSection
                        files={files}
                        setFiles={setFiles}
                        setExtractionStatus={setExtractionStatus}
                        setTemplateData={setTemplateData}
                        message={message}
                        setMessage={setMessage}
                    />
                    <DataSection
                        files={files}
                        extractionStatus={extractionStatus}
                        templateData={templateData}
                        setTemplateData={setTemplateData}
                    />
                    <PreviewSection
                        extractionStatus={extractionStatus}
                        templateData={templateData}
                    />
                </div>
            </div>
        </div>
    );
}

interface UploadSectionProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setExtractionStatus: React.Dispatch<React.SetStateAction<ExtractionStatus>>;
    setTemplateData: React.Dispatch<React.SetStateAction<PozovTemplateData | null>>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
}

function UploadSection({
    files,
    setFiles,
    setExtractionStatus,
    setTemplateData,
    message,
    setMessage,
}: UploadSectionProps) {
    const filesRef = useRef(files);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    const totalSize = useMemo(() => {
        return files.reduce((acc, f) => acc + f.size, 0);
    }, [files]);

    const progressPercent = useMemo(() => {
        return Math.min((totalSize / MAX_FILE_SIZE) * 100, 100);
    }, [totalSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles((prev) => [...prev, ...acceptedFiles]);
        },
    });

    const messageRef = useRef(message);

    useEffect(() => {
        messageRef.current = message;
    }, [message]);

    const extractData = useCallback(async () => {
        const currentFiles = filesRef.current;
        if (currentFiles.length === 0) return;

        setExtractionStatus("extracting");
        setTemplateData(null);

        try {
            const result = await extractPozovTemplateData(currentFiles, messageRef.current);
            const parsed = pozovTemplateDataSchema.parse(result);
            setExtractionStatus("success");
            setTemplateData(parsed);
        } catch (err) {
            console.error(err);
            setExtractionStatus("error");
        }
    }, [setExtractionStatus, setTemplateData]);

    const removeFile = useCallback(
        (fileName: string) => {
            setFiles((prev) => prev.filter((f) => f.name !== fileName));
        },
        [setFiles],
    );

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Документи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Завантажено</span>
                        <span>{formatBytes(totalSize)} / 50 MB</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>

                <div
                    {...getRootProps()}
                    className={cn(
                        isDragActive
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-border",
                        "flex justify-center rounded-md border border-dashed p-6 transition-colors duration-200 cursor-pointer hover:border-primary/50",
                    )}
                >
                    <div className="text-center">
                        <FileIcon className="mx-auto h-8 w-8 text-muted-foreground/80" />
                        <div className="mt-2 text-sm text-muted-foreground">
                            <Label className="relative cursor-pointer font-medium text-primary hover:text-primary/80">
                                <span>Оберіть файли</span>
                                <input {...getInputProps()} className="sr-only" />
                            </Label>
                        </div>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Завантажені ({files.length})</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {files.map((file) => (
                                <div
                                    key={file.name}
                                    className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1.5 group"
                                >
                                    <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="flex-1 truncate" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {formatBytes(file.size)}
                                    </span>
                                    <button
                                        onClick={() => removeFile(file.name)}
                                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-opacity"
                                        title="Видалити"
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Додаткові інструкції</Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                        placeholder="Опишіть додаткові деталі або виправлення..."
                        className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
                </div>

                <Button
                    onClick={extractData}
                    disabled={files.length === 0}
                    className="w-full"
                    size="sm"
                >
                    Видобути дані
                </Button>
            </CardContent>
        </Card>
    );
}

interface DataSectionProps {
    files: File[];
    extractionStatus: ExtractionStatus;
    templateData: PozovTemplateData | null;
    setTemplateData: React.Dispatch<React.SetStateAction<PozovTemplateData | null>>;
}

function DataSection({ files, extractionStatus, templateData, setTemplateData }: DataSectionProps) {
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Документи та Дані</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {files.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex gap-1 flex-wrap">
                            {files.map((file, i) => (
                                <button
                                    key={file.name}
                                    onClick={() => setSelectedFileIndex(i)}
                                    className={cn(
                                        "text-xs px-2 py-1 rounded transition-colors",
                                        i === selectedFileIndex
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80",
                                    )}
                                >
                                    {i + 1}.{" "}
                                    {file.name.length > 20
                                        ? file.name.slice(0, 20) + "..."
                                        : file.name}
                                </button>
                            ))}
                        </div>
                        <div className="border rounded-md overflow-hidden">
                            <FilePreview file={files[selectedFileIndex]} />
                        </div>
                    </div>
                )}

                {extractionStatus === "error" ? (
                    <Alert variant="destructive" className="mb-4">
                        Помилка видобування даних
                    </Alert>
                ) : extractionStatus === "idle" ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        Завантажте документи для видобування даних
                    </div>
                ) : extractionStatus === "extracting" ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        Видобування даних...
                    </div>
                ) : (
                    templateData && (
                        <JsonPreview
                            data={templateData}
                            onChange={(newData) => setTemplateData(newData)}
                            keyLabel="полів"
                            itemLabel="предметів"
                            trueLabel="Так"
                            falseLabel="Ні"
                            className="max-h-[500px] overflow-auto"
                        />
                    )
                )}
            </CardContent>
        </Card>
    );
}

interface PreviewSectionProps {
    extractionStatus: ExtractionStatus;
    templateData: PozovTemplateData | null;
}

function PreviewSection({ extractionStatus, templateData }: PreviewSectionProps) {
    const generatedText = useMemo(() => {
        try {
            if (!templateData || templateData == null) return "";

            return generatePozovText(templateData);
        } catch {
            return "";
        }
    }, [templateData]);

    const saveDocx = useCallback(() => {
        if (!templateData || !generatedText) return;

        const doc = generatePozovDocx(generatedText);
        Packer.toBlob(doc).then((blob) => {
            const fileName = `позов ${(templateData as Record<string, unknown>)["ПІБ позивача"] ?? "pozov"}.docx`;
            saveAs(blob, fileName);
        });
    }, [templateData, generatedText]);

    const renderPreview = () => {
        if (!generatedText) return null;

        const paragraphs = generatedText.split("/t").filter((p) => p.trim());

        return paragraphs.map((para, i) => {
            const isCentered = para.trim().startsWith("/c");
            const content = isCentered ? para.trim().replace(/^\/c/, "").trim() : para.trim();

            return (
                <p
                    key={`para-${i}-${content.slice(0, 30)}`}
                    className={cn(
                        "text-sm font-mono my-1 text-justify leading-relaxed",
                        isCentered ? "text-center" : "pl-8 first-line:pl-0",
                    )}
                >
                    {content}
                </p>
            );
        });
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Попередній перегляд позову</CardTitle>
            </CardHeader>
            <CardContent>
                {extractionStatus === "idle" || extractionStatus === "extracting" ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        {extractionStatus === "extracting"
                            ? "Генерація..."
                            : "Завантажте документи"}
                    </div>
                ) : !templateData ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Помилка видобування даних
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Попередній перегляд оновлюється автоматично
                            </p>
                            <Button onClick={saveDocx} size="sm">
                                Зберегти DOCX
                            </Button>
                        </div>
                        <div className="max-h-[600px] overflow-auto bg-muted/30 rounded-md p-4">
                            <div className="space-y-0.5">{renderPreview()}</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
