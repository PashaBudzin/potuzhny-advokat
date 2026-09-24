import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export function aiEnv() {
    return createEnv({
        skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
        server: {
            GEMINI_API_KEY: z.string().min(1),
            GROQ_API_KEY: z.string().optional(),
        },
        runtimeEnv: process.env,
    });
}

export type AiEnv = ReturnType<typeof aiEnv>;
