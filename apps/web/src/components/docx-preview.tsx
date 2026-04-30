"use client";

import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";
import "./docx-preview.css";

function DocxPreview({ file, small }: { file: File; small?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        file.arrayBuffer().then((buffer) => {
            renderAsync(buffer, containerRef.current!, undefined, {
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
            });
        });
    }, [file]);

    return (
        <div
            ref={containerRef}
            className={small ? "docx-preview small-preview" : "docx-preview dialog-preview"}
        />
    );
}

export default DocxPreview;
