/**
 * Hash algorithm supported by Hawk authentication.
 *
 * The eCourt API documentation specifies HMAC-SHA256. SHA-1 is accepted for
 * compatibility with other Hawk implementations.
 */
export type HawkHashAlgorithm = "sha256" | "sha1";

/**
 * Credentials used to sign requests with the Hawk protocol.
 *
 * The eCourt administrator issues the `id` (Hawk Auth ID) and `key`
 * (Hawk Auth Key) when access to the corporate API is granted.
 */
export interface HawkCredentials {
    /** Hawk Auth ID issued by the eCourt administrator. */
    id: string;
    /** Hawk Auth Key issued by the eCourt administrator. */
    key: string;
    /** HMAC algorithm. Defaults to `sha256`. */
    algorithm?: HawkHashAlgorithm;
    /**
     * Include the query string in the signed resource.
     *
     * Hawk implementations normally sign `pathname + search`. Set this to
     * `false` only if the server is known to sign the pathname alone.
     * Defaults to `true`.
     */
    includeQueryInResource?: boolean;
}

/**
 * Optional overrides used when generating a Hawk `Authorization` header.
 */
export interface HawkSigningOptions {
    /** Unix timestamp in seconds. Defaults to the current time. */
    timestamp?: number;
    /** Nonce value. Defaults to a cryptographically random 6-character string. */
    nonce?: string;
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const NONCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Create an `Authorization: Hawk ...` header value for a request.
 *
 * The function implements the standard Hawk 1.0 header signing scheme:
 * `hawk.1.header\n{ts}\n{nonce}\n{method}\n{resource}\n{host}\n{port}\n\n\n`
 * signed with HMAC and encoded as base64.
 *
 * The eCourt API documentation describes the same scheme (section 3.1.1) and
 * uses HMAC-SHA256 by default.
 *
 * @param url - Absolute request URL.
 * @param method - HTTP method used for the request.
 * @param credentials - Hawk credentials.
 * @param options - Optional timestamp and nonce overrides, mainly for tests.
 * @returns A complete `Authorization` header value.
 *
 * @example
 * ```ts
 * const header = await createHawkAuthorization(
 *   new URL("https://api-corp.court.gov.ua/api/v1/data/case?limit=10"),
 *   "GET",
 *   { id: "dh37fgj492je", key: "secret" },
 * );
 * ```
 */
export async function createHawkAuthorization(
    url: URL,
    method: string,
    credentials: HawkCredentials,
    options: HawkSigningOptions = {},
): Promise<string> {
    const cryptoApi = globalThis.crypto;

    if (!cryptoApi?.subtle) {
        throw new Error(
            "Web Crypto API is not available. Hawk authentication requires globalThis.crypto.subtle.",
        );
    }

    const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000);
    const nonce = options.nonce ?? createNonce(cryptoApi);
    const algorithm = credentials.algorithm === "sha1" ? "SHA-1" : "SHA-256";
    const resource =
        credentials.includeQueryInResource === false
            ? url.pathname
            : `${url.pathname}${url.search}`;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");

    const normalized = [
        "hawk.1.header",
        String(timestamp),
        nonce,
        method.toUpperCase(),
        resource,
        url.hostname,
        port,
        "",
        "",
    ].join("\n");

    const signature = normalized + "\n";
    const key = await cryptoApi.subtle.importKey(
        "raw",
        new TextEncoder().encode(credentials.key),
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"],
    );
    const macBuffer = await cryptoApi.subtle.sign("HMAC", key, new TextEncoder().encode(signature));
    const mac = toBase64(new Uint8Array(macBuffer));

    return `Hawk id="${escapeHeaderValue(credentials.id)}", ts="${timestamp}", nonce="${nonce}", mac="${mac}"`;
}

/**
 * Generate a cryptographically random nonce in the format required by Hawk.
 *
 * @param cryptoApi - Web Crypto implementation.
 * @returns A six-character alphanumeric nonce.
 */
function createNonce(cryptoApi: Crypto): string {
    const bytes = new Uint8Array(6);
    cryptoApi.getRandomValues(bytes);

    let nonce = "";
    for (const byte of bytes) {
        nonce += NONCE_ALPHABET[byte % NONCE_ALPHABET.length];
    }

    return nonce;
}

/**
 * Escape a value included inside the `Authorization` header.
 *
 * @param value - Raw header value.
 * @returns Escaped value.
 */
function escapeHeaderValue(value: string): string {
    return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

/**
 * Encode bytes as base64 without relying on environment-specific globals.
 *
 * @param bytes - Bytes to encode.
 * @returns Base64 string.
 */
function toBase64(bytes: Uint8Array): string {
    let result = "";

    for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index] ?? 0;
        const second = bytes[index + 1];
        const third = bytes[index + 2];

        const firstSextet = first >> 2;
        const secondSextet = ((first & 0x03) << 4) | ((second ?? 0) >> 4);
        const thirdSextet =
            second === undefined ? undefined : ((second & 0x0f) << 2) | ((third ?? 0) >> 6);
        const fourthSextet = third === undefined ? undefined : third & 0x3f;

        result += BASE64_ALPHABET[firstSextet];
        result += BASE64_ALPHABET[secondSextet];
        result += thirdSextet === undefined ? "=" : BASE64_ALPHABET[thirdSextet];
        result += fourthSextet === undefined ? "=" : BASE64_ALPHABET[fourthSextet];
    }

    return result;
}
