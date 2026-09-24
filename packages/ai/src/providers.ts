import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

import type { AiEnv } from "./env";

export function createProviders(env: AiEnv) {
    const google = createGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
    });

    const groq = env.GROQ_API_KEY
        ? createGroq({
              apiKey: env.GROQ_API_KEY,
          })
        : null;

    return {
        google,
        groq,
        fastModel: () =>
            env.GROQ_API_KEY && groq
                ? groq("openai/gpt-oss-120b")
                : google("gemini-flash-lite-latest"),
        mainModel: google("gemini-flash-lite-latest"),
    };
}

export type Providers = ReturnType<typeof createProviders>;
