"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DocxPreview from "./docx-preview";
import ExcelPreview from "./xlsx-preview";

function FilePreview({ file }: { file: File }) {
    const [showPreview, setShowPreview] = React.useState(false);

    return (
        <>
            <div
                className="h-48 w-full cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                }}
            >
                <FileTypePreview file={file} small />
            </div>
            <Dialog open={showPreview} onOpenChange={(v) => setShowPreview(v)}>
                <DialogHeader>
                    <DialogTitle>File preview</DialogTitle>
                </DialogHeader>
                <DialogContent className="h-[80vh] max-w-[90vw]">
                    <FileTypePreview file={file} />
                </DialogContent>
            </Dialog>
        </>
    );
}

const MemoizedFilePreview = React.memo(FilePreview, (prev, curr) => {
    return prev.file.name === curr.file.name && prev.file.size === curr.file.size;
});

function FileTypePreview({ file, small }: { file: File; small?: boolean }) {
    if (file.type === "application/pdf") {
        return <PdfPreview file={file} small={small} />;
    }

    if (file.type.startsWith("image/")) {
        return <ImagePreview file={file} small={small} />;
    }

    if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
    ) {
        return <DocxPreview file={file} small={small} />;
    }

    if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
    ) {
        return <ExcelPreview file={file} small={small} />;
    }

    return <p>Unsupported file type</p>;
}

function PdfPreview({ file, small }: { file: File; small?: boolean }) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
        const container = containerRef.current;

        if (!container) return;

        const renderPage = async (pageProxy: import("pdfjs-dist").PDFPageProxy, scale: number) => {
            const viewport = pageProxy.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const devicePixelRatio = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * devicePixelRatio);
            canvas.height = Math.floor(viewport.height * devicePixelRatio);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;
            const transform =
                devicePixelRatio === 1
                    ? undefined
                    : [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0];
            await pageProxy.render({ canvas, viewport, transform }).promise;
            return canvas;
        };

        (async () => {
            try {
                const pdfjs = await import("pdfjs-dist");
                pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                    "pdfjs-dist/build/pdf.worker.min.mjs",
                    import.meta.url,
                ).toString();
                const data = await file.arrayBuffer();
                doc = await pdfjs.getDocument({ data }).promise;
                if (cancelled) return;

                const pageNumbers = small
                    ? [1]
                    : Array.from({ length: doc.numPages }, (_, i) => i + 1);
                const pages = await Promise.all(pageNumbers.map((num) => doc!.getPage(num)));
                if (cancelled) return;

                const scale = small ? 0.4 : 1.5;
                const canvases = await Promise.all(pages.map((page) => renderPage(page, scale)));
                if (cancelled) return;

                container.replaceChildren(...canvases);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to render PDF");
                }
            }
        })();

        return () => {
            cancelled = true;
            container.replaceChildren();
            void doc?.destroy();
        };
    }, [file, small]);

    return (
        <div
            ref={containerRef}
            className={cn(
                small
                    ? "h-full w-full flex items-center justify-center overflow-hidden"
                    : "flex flex-col items-center gap-4 overflow-auto p-4",
            )}
        >
            {error ? (
                <p className="text-sm text-destructive">Failed to render PDF: {error}</p>
            ) : null}
        </div>
    );
}

function ImagePreview({ file, small }: { file: File; small?: boolean }) {
    const url = URL.createObjectURL(file);

    return (
        <img
            src={url}
            className={small ? "h-full w-full object-contain" : "h-full w-full object-contain"}
        />
    );
}

export { MemoizedFilePreview as FilePreview };
