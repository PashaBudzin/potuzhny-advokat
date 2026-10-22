import { EcourtApiError, EcourtNetworkError, EcourtParseError, EcourtTimeoutError } from "./errors";
import { createHawkAuthorization } from "./hawk";
import type { HawkCredentials } from "./hawk";
import type { ApiTransport, EcourtRawRequestOptions, EcourtRequestOptions } from "./internal";
import { toSearchParams } from "./query";
import { AsvpResource } from "./resources/asvp";
import { ClaimsResource } from "./resources/claims";
import { DataResource } from "./resources/data";
import { DictionariesResource } from "./resources/dictionaries";
import { MessagesResource } from "./resources/messages";
import { PartyDocsResource } from "./resources/party-docs";
import { PowerOfAttorneyResource } from "./resources/poa";
import { StorageResource } from "./resources/storage";
import type { CrudQuery } from "./types/common";

/**
 * Base URLs of the eCourt corporate API.
 */
export const ECOURT_BASE_URLS = {
    production: "https://api-corp.court.gov.ua",
    stage: "https://stage-api-corp.court.gov.ua",
    test: "https://test-api-corp.court.gov.ua",
} as const;

/**
 * Environment used to select the API base URL.
 */
export type EcourtEnvironment = keyof typeof ECOURT_BASE_URLS;

/**
 * Hawk authentication configuration.
 */
export interface EcourtHawkAuth {
    /** Hawk credentials issued by the eCourt administrator. */
    hawk: HawkCredentials;
}

/**
 * Bearer token authentication configuration.
 */
export interface EcourtTokenAuth {
    /** Static bearer token or a function returning a fresh token. */
    token: string | (() => string | Promise<string>);
}

/**
 * Authentication supported by the eCourt corporate API.
 */
export type EcourtAuth = EcourtHawkAuth | EcourtTokenAuth;

/**
 * Options accepted by {@link EcourtClient}.
 */
export interface EcourtClientOptions {
    /**
     * Environment used when {@link EcourtClientOptions.baseUrl} is not set.
     * Defaults to `production`.
     */
    environment?: EcourtEnvironment;
    /**
     * API base URL without the `/api/v1` prefix, e.g.
     * `https://stage-api-corp.court.gov.ua`.
     */
    baseUrl?: string;
    /**
     * API prefix appended to the base URL. Defaults to `/api/v1`. Pass an empty
     * string to use the base URL as-is.
     */
    apiPrefix?: string;
    /** Authentication credentials. */
    auth?: EcourtAuth;
    /** Default headers sent with every request. */
    headers?: HeadersInit;
    /**
     * Custom fetch implementation. Defaults to `globalThis.fetch`.
     *
     * This is useful for tests, proxies and runtimes with a custom transport.
     */
    fetch?: typeof fetch;
    /**
     * Default request timeout in milliseconds. Defaults to `30000`. Set to `0`
     * to disable timeouts.
     */
    timeoutMs?: number;
}

/**
 * Client for the eCourt corporate API.
 *
 * @example Hawk authentication
 * ```ts
 * const client = new EcourtClient({
 *   environment: "stage",
 *   auth: {
 *     hawk: {
 *       id: process.env.ECOURT_HAWK_ID!,
 *       key: process.env.ECOURT_HAWK_KEY!,
 *     },
 *   },
 * });
 *
 * const courts = await client.dictionaries.courts.list({ limit: 10 });
 * ```
 *
 * @example Bearer authentication
 * ```ts
 * const client = new EcourtClient({
 *   auth: { token: process.env.ECOURT_TOKEN! },
 * });
 * ```
 */
export class EcourtClient implements ApiTransport {
    /** Dictionary resources. */
    readonly dictionaries: DictionariesResource;
    /** Court data resources. */
    readonly data: DataResource;
    /** Message queue resources. */
    readonly messages: MessagesResource;
    /** File storage resources. */
    readonly storage: StorageResource;
    /** Claim resources. */
    readonly claims: ClaimsResource;
    /** Party document resources. */
    readonly partyDocs: PartyDocsResource;
    /** Power of attorney resources. */
    readonly powerOfAttorney: PowerOfAttorneyResource;
    /** Alias for {@link EcourtClient.powerOfAttorney}. */
    readonly poa: PowerOfAttorneyResource;
    /** Enforcement proceeding document resources. */
    readonly asvp: AsvpResource;

    private readonly baseUrl: string;
    private readonly apiPrefix: string;
    private readonly auth: EcourtAuth | undefined;
    private readonly defaultHeaders: Headers;
    private readonly fetchImpl: typeof fetch;
    private readonly timeoutMs: number;

    /**
     * @param options - Client configuration.
     */
    constructor(options: EcourtClientOptions = {}) {
        this.baseUrl = normalizeBaseUrl(
            options.baseUrl ?? ECOURT_BASE_URLS[options.environment ?? "production"],
        );
        this.apiPrefix = normalizePrefix(options.apiPrefix ?? "/api/v1");
        this.auth = options.auth;
        this.defaultHeaders = new Headers(options.headers);
        this.timeoutMs = options.timeoutMs ?? 30_000;

        if (!this.defaultHeaders.has("accept")) {
            this.defaultHeaders.set("accept", "application/json");
        }

        const fetchImpl = options.fetch ?? globalThis.fetch;
        if (!fetchImpl) {
            throw new Error(
                "No fetch implementation available. Pass one through EcourtClientOptions.fetch.",
            );
        }
        this.fetchImpl = fetchImpl;

        this.dictionaries = new DictionariesResource(this);
        this.data = new DataResource(this);
        this.messages = new MessagesResource(this);
        this.storage = new StorageResource(this);
        this.claims = new ClaimsResource(this);
        this.partyDocs = new PartyDocsResource(this);
        this.powerOfAttorney = new PowerOfAttorneyResource(this);
        this.poa = this.powerOfAttorney;
        this.asvp = new AsvpResource(this);
    }

    /**
     * Perform a GET request and parse the JSON response.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param query - CRUD query parameters.
     * @param options - Per-request options.
     * @returns Parsed response body.
     */
    get<T>(path: string, query?: CrudQuery, options?: EcourtRequestOptions): Promise<T> {
        return this.request<T>(path, { ...options, method: "GET", query });
    }

    /**
     * Perform a POST request with a JSON body and parse the JSON response.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param body - JSON body.
     * @param options - Per-request options.
     * @returns Parsed response body.
     */
    post<T>(path: string, body?: unknown, options?: EcourtRequestOptions): Promise<T> {
        return this.request<T>(path, { ...options, method: "POST", json: body });
    }

    /**
     * Perform a POST request with a JSON body and discard the response body.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param body - JSON body.
     * @param options - Per-request options.
     */
    postVoid(path: string, body?: unknown, options?: EcourtRequestOptions): Promise<void> {
        return this.requestVoid(path, { ...options, method: "POST", json: body });
    }

    /**
     * Perform a DELETE request and parse the JSON response.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param options - Per-request options.
     * @returns Parsed response body.
     */
    delete<T>(path: string, options?: EcourtRequestOptions): Promise<T> {
        return this.request<T>(path, { ...options, method: "DELETE" });
    }

    /**
     * Perform a DELETE request and discard the response body.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param options - Per-request options.
     */
    deleteVoid(path: string, options?: EcourtRequestOptions): Promise<void> {
        return this.requestVoid(path, { ...options, method: "DELETE" });
    }

    /**
     * Perform an arbitrary request and parse the JSON response.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param options - Request options.
     * @returns Parsed response body.
     */
    async request<T>(path: string, options: EcourtRawRequestOptions = {}): Promise<T> {
        const response = await this.requestRaw(path, options);
        const text = await response.text();

        if (text.trim().length === 0) {
            throw new EcourtParseError("Expected a JSON response but the body was empty", {
                body: text,
                url: response.url,
                method: options.method ?? "GET",
            });
        }

        try {
            const data: T = JSON.parse(text);
            return data;
        } catch (error) {
            throw new EcourtParseError("Failed to parse the eCourt API response as JSON", {
                body: text,
                url: response.url,
                method: options.method ?? "GET",
                cause: error,
            });
        }
    }

    /**
     * Perform an arbitrary request and discard the response body.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param options - Request options.
     */
    async requestVoid(path: string, options: EcourtRawRequestOptions = {}): Promise<void> {
        const response = await this.requestRaw(path, options);
        await response.arrayBuffer();
    }

    /**
     * Perform an arbitrary request and return the raw `Response`.
     *
     * Non-2xx responses are converted to {@link EcourtApiError}.
     *
     * @param path - Resource path relative to the API prefix, or an absolute URL.
     * @param options - Request options.
     * @returns Raw fetch response for a successful request.
     */
    async requestRaw(path: string, options: EcourtRawRequestOptions = {}): Promise<Response> {
        const method = (options.method ?? "GET").toUpperCase();
        const url = this.buildUrl(path, options.query);
        const headers = new Headers(this.defaultHeaders);

        if (options.headers) {
            new Headers(options.headers).forEach((value, name) => {
                headers.set(name, value);
            });
        }

        const hasJson = options.json !== undefined;
        const body = hasJson ? JSON.stringify(options.json) : options.body;

        if (hasJson && !headers.has("content-type")) {
            headers.set("content-type", "application/json");
        }

        if (!headers.has("authorization")) {
            const authorization = await this.createAuthorization(url, method);
            if (authorization) {
                headers.set("authorization", authorization);
            }
        }

        const response = await this.performFetch(
            url,
            { method, headers, body },
            options.timeoutMs ?? this.timeoutMs,
            options.signal,
        );

        if (!response.ok) {
            throw new EcourtApiError({
                status: response.status,
                statusText: response.statusText,
                body: await parseErrorBody(response),
                url: response.url || url.toString(),
                method,
                clientId: response.headers.get("x-client-id"),
                requestId: response.headers.get("x-request-id"),
            });
        }

        return response;
    }

    /**
     * Build an absolute URL, applying the API prefix and query parameters.
     *
     * @param path - Resource path or absolute URL.
     * @param query - CRUD query or pre-built search parameters.
     * @returns Absolute request URL.
     */
    private buildUrl(path: string, query?: CrudQuery | URLSearchParams): URL {
        let url: URL;

        if (/^https?:\/\//i.test(path)) {
            url = new URL(path);
        } else {
            const suffix = path.startsWith("/") ? path : `/${path}`;
            url = new URL(`${this.baseUrl}${this.apiPrefix}${suffix}`);
        }

        if (query) {
            const params = query instanceof URLSearchParams ? query : toSearchParams(query);
            params.forEach((value, name) => {
                url.searchParams.append(name, value);
            });
        }

        return url;
    }

    /**
     * Create the `Authorization` header value for a request.
     *
     * @param url - Request URL.
     * @param method - HTTP method.
     * @returns Authorization header value, or `null` when no auth is configured.
     */
    private async createAuthorization(url: URL, method: string): Promise<string | null> {
        if (!this.auth) {
            return null;
        }

        if ("hawk" in this.auth) {
            return createHawkAuthorization(url, method, this.auth.hawk);
        }

        const token =
            typeof this.auth.token === "function" ? await this.auth.token() : this.auth.token;

        return `Bearer ${token}`;
    }

    /**
     * Execute `fetch` with timeout and signal handling.
     *
     * @param url - Request URL.
     * @param init - Fetch options.
     * @param timeoutMs - Timeout in milliseconds. Zero disables the timeout.
     * @param externalSignal - Optional caller-provided abort signal.
     * @returns Fetch response.
     */
    private async performFetch(
        url: URL,
        init: RequestInit,
        timeoutMs: number,
        externalSignal?: AbortSignal,
    ): Promise<Response> {
        const controller = new AbortController();
        let timedOut = false;

        const abortFromCaller = (): void => {
            controller.abort(externalSignal?.reason);
        };

        if (externalSignal) {
            if (externalSignal.aborted) {
                abortFromCaller();
            } else {
                externalSignal.addEventListener("abort", abortFromCaller, { once: true });
            }
        }

        const timer: ReturnType<typeof setTimeout> | undefined =
            timeoutMs > 0
                ? setTimeout(() => {
                      timedOut = true;
                      controller.abort();
                  }, timeoutMs)
                : undefined;

        try {
            return await this.fetchImpl(url, { ...init, signal: controller.signal });
        } catch (error) {
            if (timedOut) {
                throw new EcourtTimeoutError(timeoutMs);
            }

            if (externalSignal?.aborted) {
                throw error;
            }

            throw new EcourtNetworkError(
                `Network request to the eCourt API failed: ${url.toString()}`,
                error,
            );
        } finally {
            if (timer !== undefined) {
                clearTimeout(timer);
            }

            externalSignal?.removeEventListener("abort", abortFromCaller);
        }
    }
}

/**
 * Normalize a base URL by removing trailing slashes.
 *
 * @param value - Base URL.
 * @returns Normalized URL without a trailing slash.
 */
function normalizeBaseUrl(value: string): string {
    return value.replace(/\/+$/, "");
}

/**
 * Normalize the API prefix.
 *
 * @param value - Prefix, e.g. `/api/v1` or `api/v1`.
 * @returns Prefix with a leading slash and without a trailing slash, or an
 * empty string when the prefix is empty.
 */
function normalizePrefix(value: string): string {
    const trimmed = value.trim();

    if (trimmed === "" || trimmed === "/") {
        return "";
    }

    return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

/**
 * Read and parse an error response body.
 *
 * @param response - Failed response.
 * @returns Parsed JSON body, raw text, or `null` for an empty body.
 */
async function parseErrorBody(response: Response): Promise<unknown> {
    const text = await response.text();

    if (text.trim().length === 0) {
        return null;
    }

    try {
        const data: unknown = JSON.parse(text);
        return data;
    } catch {
        return text;
    }
}
