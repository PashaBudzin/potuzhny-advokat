import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";

export const env = createEnv({
    extends: [vercel()],
    server: {
        GEMINI_API_KEY: z.string(),
        GROQ_API_KEY: z.string().optional(),

        IMAP_USER: z.string().optional(),
        IMAP_PASS: z.string().optional(),
        DATABASE_URL: z.string(),
        TELEGRAM_TOKEN: z.string().optional(),
        BRIEFING_CHAT_ID: z.string().optional(),
        BRIEFING_THREAD_ID: z.string().optional(),
        PASSWORD_HASH: z.string().optional(),
        HMAC_SECRET: z.string().optional(),

        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    },
    experimental__runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
    },
});
