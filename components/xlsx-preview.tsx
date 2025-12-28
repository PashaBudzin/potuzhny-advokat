"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function ExcelPreview({ file }: { file: File }) {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const ab = e.target?.result;
      if (!ab) return;

      const workbook = XLSX.read(ab, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // first sheet
      const worksheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // 2D array
      });

      setData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  if (!data.length) return <p>Loading...</p>;

  return (
    <table className="border-collapse border border-gray-400">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border border-gray-300 p-1">
                {cell?.toString() || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExcelPreview;
