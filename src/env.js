import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),

  IMAP_USER: z.string().optional(),
  IMAP_PASS: z.string().optional(),
  DATABASE_URL: z.string(),
  TELEGRAM_TOKEN: z.string().optional(),
  BRIEFING_CHAT_ID: z.string().optional(),
  BRIEFING_THREAD_ID: z.string().optional(),
  PASSWORD_HASH: z.string().optional(),
  HMAC_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

export { env };
