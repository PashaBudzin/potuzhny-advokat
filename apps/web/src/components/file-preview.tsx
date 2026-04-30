"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
        return <PdfPreview file={file} />;
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

function PdfPreview({ file }: { file: File }) {
    const url = URL.createObjectURL(file);

    return <object data={url} type="application/pdf" className="h-full w-full"></object>;
}

function ImagePreview({ file, small }: { file: File; small?: boolean }) {
    const url = URL.createObjectURL(file);

    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={url}
            className={small ? "h-full w-full object-contain" : "h-full w-full object-contain"}
        />
    );
}

export { MemoizedFilePreview as FilePreview };
