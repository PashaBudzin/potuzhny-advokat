import { Document, Paragraph, TextRun, AlignmentType } from "docx";

export function generatePozovDocx(text: string): Document {
  const paragraphs: Paragraph[] = [];

  const normalized = text.replace(/\r\n/g, "\n");

  const rawParagraphs = normalized.split("/t");

  for (const raw of rawParagraphs) {
    if (!raw.trim()) continue;

    const lines = raw.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      const trimmed = line.trimStart();

      const isCentered = trimmed.startsWith("/c");
      const content = isCentered ? trimmed.slice(2).trimStart() : trimmed;

      const runs: TextRun[] = [];
      let buffer = "";
      let red = false;

      for (const ch of content) {
        if (ch === "*") {
          if (buffer) {
            runs.push(
              new TextRun({
                text: buffer,
                size: 24, // 12 pt
                color: red ? "FF0000" : "000000",
              }),
            );
            buffer = "";
          }
          red = !red;
        } else {
          buffer += ch;
        }
      }

      if (buffer) {
        runs.push(
          new TextRun({
            text: buffer,
            size: 24,
            color: red ? "FF0000" : "000000",
          }),
        );
      }

      paragraphs.push(
        new Paragraph({
          children: runs,
          alignment: isCentered
            ? AlignmentType.CENTER
            : AlignmentType.JUSTIFIED,

          // first-line tab indent
          indent: isCentered ? undefined : { firstLine: 720 },

          // tight legal spacing
          spacing: {
            line: 240,
            after: 120,
          },
        }),
      );
    }
  }

  return new Document({
    styles: {
      default: { document: { run: { language: { value: "uk-UA" } } } },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}
