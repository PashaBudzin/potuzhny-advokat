import { z } from "zod";

const envSchema = z.object({
    TELEGRAM_TOKEN: z.string().optional(),
    BRIEFING_CHAT_ID: z.string().optional(),
    BRIEFING_THREAD_ID: z.string().optional(),
    IMAP_USER: z.string().optional(),
    IMAP_PASS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
