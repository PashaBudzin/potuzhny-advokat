import {
    hashPassServer as hashServer,
    validatePass,
    hashPassBrowser as hashBrowser,
} from "@potuzhny-advokat/auth-crypto";
import { env } from "@/env";

export function hashPassServer(password: string): string {
    return hashServer(password);
}

export function validatePassLocal(passwordHash: string): boolean {
    if (!env.PASSWORD_HASH) return false;
    return validatePass(passwordHash, env.PASSWORD_HASH);
}

export async function hashPassBrowser(password: string): Promise<string> {
    return hashBrowser(password);
}
