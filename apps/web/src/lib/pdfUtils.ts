/**
 * @deprecated
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    if (typeof window === "undefined") {
        throw new Error("PDF extraction can only run in the browser");
    }

    const pdfjsLib = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1));
    const pages = await Promise.all(pagePromises);

    const contentPromises = pages.map((page) => page.getTextContent());
    const contents = await Promise.all(contentPromises);

    const fullText = contents
        .map((content) => content.items.map((item: { str: string }) => item.str).join(" "))
        .join("\n");

    return fullText;
}
