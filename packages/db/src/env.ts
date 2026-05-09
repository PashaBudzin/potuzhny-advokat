import { createEnv } from "@t3-oss/env-core";
import z from "zod/v4";

export function dbEnv() {
    return createEnv({
        server: {
            DATABASE_URL: z.url(),
        },
        runtimeEnv: process.env,
    });
}
