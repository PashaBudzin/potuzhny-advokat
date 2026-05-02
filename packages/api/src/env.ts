import { z } from "zod";

const envSchema = z.object({
    PASSWORD_HASH: z.string().optional(),
});

export const env = envSchema.parse(process.env);
