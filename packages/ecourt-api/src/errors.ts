/**
 * Details attached to an {@link EcourtApiError}.
 */
export interface EcourtApiErrorDetails {
    /** HTTP status code returned by the API. */
    status: number;
    /** HTTP status text returned by the API. */
    statusText: string;
    /** Parsed response body, or the raw text when the body is not JSON. */
    body: unknown;
    /** Request URL that produced the error. */
    url: string;
    /** HTTP method used for the request. */
    method: string;
    /** Value of the `x-client-id` response header, when present. */
    clientId?: string | null;
    /** Value of the `x-request-id` response header, when present. */
    requestId?: string | null;
}

/**
 * Error thrown when the eCourt API returns a non-2xx HTTP response.
 *
 * @example
 * ```ts
 * try {
 *   await client.claims.submit(claim);
 * } catch (error) {
 *   if (error instanceof EcourtApiError) {
 *     console.error(error.status, error.messages);
 *   }
 * }
 * ```
 */
export class EcourtApiError extends Error {
    /** HTTP status code returned by the API. */
    readonly status: number;
    /** HTTP status text returned by the API. */
    readonly statusText: string;
    /** Parsed response body, or the raw text when the body is not JSON. */
    readonly body: unknown;
    /** Request URL that produced the error. */
    readonly url: string;
    /** HTTP method used for the request. */
    readonly method: string;
    /** Value of the `x-client-id` response header, when present. */
    readonly clientId: string | null;
    /** Value of the `x-request-id` response header, when present. */
    readonly requestId: string | null;

    /**
     * @param details - Response details captured by the HTTP client.
     */
    constructor(details: EcourtApiErrorDetails) {
        super(extractErrorMessage(details.body, details.statusText));
        this.name = "EcourtApiError";
        this.status = details.status;
        this.statusText = details.statusText;
        this.body = details.body;
        this.url = details.url;
        this.method = details.method;
        this.clientId = details.clientId ?? null;
        this.requestId = details.requestId ?? null;
    }

    /**
     * `true` when the API rejected the request with HTTP 401.
     */
    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    /**
     * `true` when the requested object was not found (HTTP 404).
     */
    get isNotFound(): boolean {
        return this.status === 404;
    }

    /**
     * `true` when the request failed validation (HTTP 400 or 422).
     */
    get isValidationError(): boolean {
        return this.status === 400 || this.status === 422;
    }

    /**
     * All messages found in the response body.
     *
     * The eCourt API returns a single string for most errors and an array of
     * strings for validation errors, so both forms are normalized here.
     */
    get messages(): string[] {
        const body = this.body;

        if (typeof body === "string" && body.length > 0) {
            return [body];
        }

        if (typeof body !== "object" || body === null || !("message" in body)) {
            return [];
        }

        const message = body.message;

        if (typeof message === "string") {
            return [message];
        }

        if (Array.isArray(message)) {
            return message.filter((item): item is string => typeof item === "string");
        }

        return [];
    }
}

/**
 * Error thrown when the request could not be completed at the network level.
 *
 * This includes DNS failures, connection resets and other `fetch` failures.
 */
export class EcourtNetworkError extends Error {
    /** Original error thrown by the fetch implementation, when available. */
    readonly cause: unknown;

    /**
     * @param message - Human-readable description of the failure.
     * @param cause - Original error thrown by `fetch`.
     */
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "EcourtNetworkError";
        this.cause = cause;
    }
}

/**
 * Error thrown when a request exceeds the configured timeout.
 */
export class EcourtTimeoutError extends EcourtNetworkError {
    /**
     * @param timeoutMs - Timeout in milliseconds.
     */
    constructor(timeoutMs: number) {
        super(`eCourt API request timed out after ${timeoutMs} ms`);
        this.name = "EcourtTimeoutError";
    }
}

/**
 * Error thrown when the API returned a successful response whose body could
 * not be parsed as JSON.
 */
export class EcourtParseError extends Error {
    /** Parsed or raw response body, when available. */
    readonly body: unknown;
    /** Request URL whose response could not be parsed. */
    readonly url: string;
    /** HTTP method used for the request. */
    readonly method: string;
    /** Original parsing error, when available. */
    readonly cause: unknown;

    /**
     * @param message - Human-readable description of the parsing failure.
     * @param details - Response details used for diagnostics.
     */
    constructor(
        message: string,
        details: { body?: unknown; url: string; method: string; cause?: unknown },
    ) {
        super(message);
        this.name = "EcourtParseError";
        this.body = details.body;
        this.url = details.url;
        this.method = details.method;
        this.cause = details.cause;
    }
}

/**
 * Extract a human-readable message from an unknown API error body.
 *
 * @param body - Parsed response body.
 * @param fallback - Message used when the body does not contain one.
 * @returns The extracted message.
 */
function extractErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === "string" && body.trim().length > 0) {
        return body;
    }

    if (typeof body !== "object" || body === null || !("message" in body)) {
        return fallback;
    }

    const message = body.message;

    if (typeof message === "string" && message.length > 0) {
        return message;
    }

    if (Array.isArray(message)) {
        const messages = message.filter((item): item is string => typeof item === "string");
        if (messages.length > 0) {
            return messages.join("; ");
        }
    }

    return fallback;
}
