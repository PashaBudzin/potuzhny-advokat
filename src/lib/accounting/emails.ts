import { DocEmail } from "./docType";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export interface FetchEmailsOptions {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmails: string[];
  since?: Date;
}

export async function fetchEmails(
  options: FetchEmailsOptions,
): Promise<DocEmail[]> {
  const { host, port, user, pass, fromEmails, since } = options;

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");

  try {
    const results: DocEmail[] = [];

    for (const fromEmail of fromEmails) {
      const searchQuery: Record<string, unknown> = { from: fromEmail };
      if (since) {
        searchQuery.since = since;
      }

      const uids = await client.search(searchQuery);
      const uidArray = Array.isArray(uids) ? uids : Object.keys(uids);

      if (uidArray.length === 0) continue;

      const fetchUids = uidArray as number[];

      for await (const message of client.fetch(fetchUids, { source: true })) {
        if (!message.source) continue;

        const parsed = await simpleParser(message.source);

        if (!parsed.date) continue;

        results.push({
          title: parsed.subject || "",
          content: parsed.text || "",
          date: parsed.date,
          caseNumber: parsed.subject?.match(/№\s*([^\s]+)/)?.[1] ?? "",
        });
      }
    }

    return results;
  } finally {
    lock.release();
    await client.logout();
  }
}