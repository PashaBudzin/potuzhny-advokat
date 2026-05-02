"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function ExcelPreview({ file, small }: { file: File; small?: boolean }) {
    const [data, setData] = useState<string[][]>([]);

    useEffect(() => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const ab = e.target?.result;
            if (!ab) return;

            const workbook = XLSX.read(ab, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
            });

            setData(jsonData);
        };

        reader.readAsArrayBuffer(file);
    }, [file]);

    if (!data.length) return <p>Loading...</p>;

    const displayData = small ? data.slice(0, 10) : data;

    return (
        <div className="overflow-auto h-full">
            <table
                className={
                    small
                        ? "border-collapse border border-gray-400 text-xs"
                        : "border-collapse border border-gray-400"
                }
            >
                <tbody>
                    {displayData.map((row, rowIndex) => (
                        // oxlint-disable-next-line react/no-array-index-key
                        <tr key={`row-${rowIndex}-${row[0] || ""}`}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    // oxlint-disable-next-line react/no-array-index-key
                                    key={`cell-${rowIndex}-${cellIndex}-${cell || ""}`}
                                    className="border border-gray-300 p-1"
                                >
                                    {cell?.toString() || ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ExcelPreview;
