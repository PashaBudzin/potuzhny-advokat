import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

import { env } from "@/env";

export const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

export const groq = createGroq({
  apiKey: env.GROQ_API_KEY,
});

export const fastModel = () =>
  env.GROQ_API_KEY
    ? groq("openai/gpt-oss-120b")
    : google("gemini-flash-lite-latest");
