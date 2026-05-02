export type DocEmail = {
    title: string;
    content: string;
    date: Date;
    caseNumber: string;
};

export type TypedDocEmail = DocEmail & { type: DocType };

export type DocType = "registration" | "ruling" | "decision" | "hearing";

/**
 * @description adds type field of type DocEmail, returns null if can't match to any type
 */
export function parseDocType(doc: DocEmail): TypedDocEmail | null {
    if (doc.title.toLowerCase().includes("ухвал")) return { ...doc, type: "ruling" };

    if (doc.title.toLowerCase().includes("автоматизованого"))
        return { ...doc, type: "registration" };

    if (
        doc.title.toLowerCase().includes("рішення") ||
        doc.title.toLowerCase().includes("судовий наказ")
    )
        return { ...doc, type: "decision" };

    if (doc.title.toLowerCase().includes("призначено слухання")) return { ...doc, type: "hearing" };

    return null;
}
