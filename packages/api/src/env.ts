import { createEnv } from "@t3-oss/env-core";
import z from "zod/v4";

export function apiEnv() {
    return createEnv({
        server: {
            PASSWORD_HASH: z.string().optional(),
        },
        runtimeEnv: process.env,
    });
}
