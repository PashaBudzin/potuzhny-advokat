import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * Extract [[Tag_Name]] placeholders from a DOCX ArrayBuffer
 * @throws if arrayBuffer can't load
 */
export function extractTags(arrayBuffer: ArrayBuffer) {
  try {
    const zip = new PizZip(arrayBuffer);
    const tagRegex = /\[\[\s*([a-zA-Z0-9_а-яА-ЯёЁґҐєЄіІїЇ]+)\s*\]\]/g;
    const allTags = new Set<string>();

    // Check main document
    const documentXml = zip?.file("word/document.xml")?.asText();
    console.log("Document XML found:", !!documentXml);
    if (documentXml) {
      console.log("Document XML length:", documentXml.length);

      // Extract all text nodes and concatenate them to find split tags
      const textNodes = documentXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const allText = textNodes
        .map((node) => {
          const content = node.replace(/<w:t[^>]*>(.*?)<\/w:t>/, "$1");
          return content.replace(/xml:space="preserve"/, "");
        })
        .join("");

      console.log("Combined text content:", allText);

      // Now find tags in the combined text
      const matches = [...allText.matchAll(tagRegex)];
      console.log("Found matches:", matches);

      matches.forEach((m) => allTags.add(m[1]));
    } else {
      console.log("Available files in zip:", Object.keys(zip.files));
    }

    // Check headers
    for (let i = 1; i <= 10; i++) {
      const headerXml = zip?.file(`word/header${i}.xml`)?.asText();
      if (headerXml) {
        // Same logic for headers - extract text nodes first
        const textNodes = headerXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
        const allText = textNodes
          .map((node) => {
            const content = node.replace(/<w:t[^>]*>(.*?)<\/w:t>/, "$1");
            return content.replace(/xml:space="preserve"/, "");
          })
          .join("");

        const matches = [...allText.matchAll(tagRegex)];
        matches.forEach((m) => allTags.add(m[1]));
      }
    }

    // Check footers
    for (let i = 1; i <= 10; i++) {
      const footerXml = zip?.file(`word/footer${i}.xml`)?.asText();
      if (footerXml) {
        // Same logic for footers - extract text nodes first
        const textNodes = footerXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
        const allText = textNodes
          .map((node) => {
            const content = node.replace(/<w:t[^>]*>(.*?)<\/w:t>/, "$1");
            return content.replace(/xml:space="preserve"/, "");
          })
          .join("");

        const matches = [...allText.matchAll(tagRegex)];
        matches.forEach((m) => allTags.add(m[1]));
      }
    }

    if (allTags.size === 0) {
      console.warn(
        "No tags found in document. Checked document.xml, headers, and footers.",
      );
    }

    return Array.from(allTags);
  } catch (error) {
    console.error("Error extracting tags:", error);
    throw error;
  }
}

export function generateDocx(
  arrayBuffer: ArrayBuffer,
  data: Record<string, string>,
) {
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    delimiters: { start: "[[ ", end: " ]]" },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
