"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import DocxPreview from "./docx-preview";
import ExcelPreview from "./xlsx-preview";

function FilePreview({ file }: { file: File }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
        <button
          className="h-full w-full ring hover:ring-primary p-10 m-3"
          onClick={() => setShowPreview(true)}
        >
          <FileTypePreview file={file} />
        </button>
      <Dialog open={showPreview} onOpenChange={(v) => setShowPreview(v)}>
        <DialogHeader>
          <DialogTitle>File preview</DialogTitle>
        </DialogHeader>
        <DialogContent className="h-[80vh] p-10">
          <FileTypePreview file={file} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function FileTypePreview({ file }: { file: File }) {
  if (file.type === "application/pdf") {
    return <PdfPreview file={file} />;
  }

  if (file.type.startsWith("image/")) {
    return <ImagePreview file={file} />;
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx") // fallback for browsers that give empty type
  ) {
    return <DocxPreview file={file} />;
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  ) {
    return <ExcelPreview file={file} />;
  }

  return <p>Unsupported file type</p>;
}

function PdfPreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);

  return (
    <object
      data={url}
      type="application/pdf"
      className="h-full w-full"
    ></object>
  );
}

function ImagePreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} className="h-full object-contain" />;
}

export { FilePreview };
