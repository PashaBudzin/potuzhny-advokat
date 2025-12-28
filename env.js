import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export { env };
