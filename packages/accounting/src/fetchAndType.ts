import { fetchEmails, type FetchEmailsOptions } from "./emails";
import { parseDocType, type TypedDocEmail } from "./docType";

export async function fetchAndTypeEmails(options: FetchEmailsOptions): Promise<TypedDocEmail[]> {
    const emails = await fetchEmails(options);
    return emails.map(parseDocType).filter((d): d is NonNullable<typeof d> => d !== null);
}
