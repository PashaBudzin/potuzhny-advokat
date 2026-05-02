export function hashPassServer(password: string): string {
    const { createHash } = require("crypto");
    return createHash("sha256").update(password).digest("base64");
}

export function validatePass(passwordHash: string, storedHash: string): boolean {
    const stored = Buffer.from(storedHash, "base64");
    const input = Buffer.from(passwordHash, "base64");

    if (stored.length !== input.length) return false;

    const { timingSafeEqual } = require("crypto");
    try {
        return timingSafeEqual(stored, input);
    } catch {
        return false;
    }
}

export async function hashPassBrowser(password: string): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
