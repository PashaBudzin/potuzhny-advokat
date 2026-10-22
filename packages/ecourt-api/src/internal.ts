import type { CrudQuery } from "./types/common";

/**
 * Per-request options shared by all transport methods.
 */
export interface EcourtRequestOptions {
    /** Signal used to cancel the request. */
    signal?: AbortSignal;
    /** Additional headers merged into the request. */
    headers?: HeadersInit;
    /** Timeout for this request in milliseconds. Overrides the client default. */
    timeoutMs?: number;
}

/**
 * Options accepted by the low-level {@link ApiTransport.request} method.
 */
export interface EcourtRawRequestOptions extends EcourtRequestOptions {
    /** HTTP method. Defaults to `GET`. */
    method?: string;
    /** Request body. It is passed to `fetch` without modification. */
    body?: BodyInit | null;
    /** JSON payload. Serialized and sent with `content-type: application/json`. */
    json?: unknown;
    /** Query parameters. */
    query?: CrudQuery | URLSearchParams;
}

/**
 * Transport contract used by resource wrappers.
 *
 * @internal
 */
export interface ApiTransport {
    get<T>(path: string, query?: CrudQuery, options?: EcourtRequestOptions): Promise<T>;
    post<T>(path: string, body?: unknown, options?: EcourtRequestOptions): Promise<T>;
    postVoid(path: string, body?: unknown, options?: EcourtRequestOptions): Promise<void>;
    delete<T>(path: string, options?: EcourtRequestOptions): Promise<T>;
    deleteVoid(path: string, options?: EcourtRequestOptions): Promise<void>;
    request<T>(path: string, options?: EcourtRawRequestOptions): Promise<T>;
    requestVoid(path: string, options?: EcourtRawRequestOptions): Promise<void>;
    requestRaw(path: string, options?: EcourtRawRequestOptions): Promise<Response>;
}

/**
 * URL-encode a storage file link while preserving its directory separators.
 *
 * The eCourt storage returns links such as `y2021/2-2-....pdf`, and these
 * slashes must remain part of the path when the file is requested.
 *
 * @param fileLink - File link returned by the storage module.
 * @returns Encoded path safe to append to a URL.
 */
export function encodeFileLink(fileLink: string): string {
    return fileLink
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}
