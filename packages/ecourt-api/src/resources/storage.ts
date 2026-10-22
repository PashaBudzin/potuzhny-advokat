import type { ApiTransport, EcourtRequestOptions } from "../internal";
import { encodeFileLink } from "../internal";
import type { DownloadedFile, UploadedFile } from "../types/storage";

/**
 * File storage resources.
 *
 * Files must be uploaded to the storage before they can be referenced from
 * claims, party documents and powers of attorney. Each document file has an
 * optional detached CADES-X Long signature (`.p7s`) uploaded separately.
 */
export class StorageResource {
    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
    }

    /**
     * Upload a file to the eCourt storage.
     *
     * The file is stored with an extension derived from `contentType`. The
     * returned `fileLink` must be used in document metadata.
     *
     * @param data - File contents.
     * @param contentType - MIME type, e.g. `application/pdf`.
     * @param options - Per-request options.
     * @returns Uploaded file metadata.
     *
     * @example
     * ```ts
     * const uploaded = await client.storage.upload(pdfBytes, "application/pdf");
     * ```
     */
    upload(
        data: Blob | ArrayBuffer | Uint8Array | string,
        contentType: string,
        options?: EcourtRequestOptions,
    ): Promise<UploadedFile> {
        return this.transport.request<UploadedFile>("/storage/file", {
            ...options,
            method: "POST",
            body: toBodyInit(data),
            headers: mergeHeaders(options?.headers, { "content-type": contentType }),
        });
    }

    /**
     * Upload a detached signature for an existing file.
     *
     * The signature must be a CADES-X Long `.p7s` container. Multiple
     * signatures for the same file are supported.
     *
     * @param fileLink - `fileLink` returned by {@link StorageResource.upload}.
     * @param signature - Signature bytes.
     * @param options - Per-request options.
     * @returns Uploaded signature metadata.
     */
    uploadSignature(
        fileLink: string,
        signature: Blob | ArrayBuffer | Uint8Array | string,
        options?: EcourtRequestOptions,
    ): Promise<UploadedFile> {
        return this.transport.request<UploadedFile>(
            `/storage/file/${encodeFileLink(fileLink)}/sign`,
            {
                ...options,
                method: "POST",
                body: toBodyInit(signature),
                headers: mergeHeaders(options?.headers, {
                    "content-type": "application/pkcs7-signature",
                }),
            },
        );
    }

    /**
     * Download a file from the eCourt storage.
     *
     * @param fileLink - Storage path returned by the API or by {@link StorageResource.upload}.
     * @param options - Per-request options.
     * @returns File bytes and response metadata.
     *
     * @example
     * ```ts
     * const file = await client.storage.download(document.original.link);
     * await Bun.write("document.pdf", file.bytes);
     * ```
     */
    async download(fileLink: string, options?: EcourtRequestOptions): Promise<DownloadedFile> {
        const response = await this.transport.requestRaw(
            `/storage/file/${encodeFileLink(fileLink)}`,
            { ...options, method: "GET" },
        );
        const buffer = await response.arrayBuffer();
        const contentLength = response.headers.get("content-length");

        return {
            bytes: new Uint8Array(buffer),
            contentType: response.headers.get("content-type"),
            contentLength: contentLength === null ? null : Number(contentLength),
            fileName: parseFileName(response.headers.get("content-disposition")),
            contentDisposition: response.headers.get("content-disposition"),
        };
    }
}

/**
 * Convert file contents to a value accepted by `fetch`.
 *
 * Typed arrays are copied into a fresh buffer so the resulting `Blob` is not
 * affected by later mutation of the caller's array.
 *
 * @param data - File contents.
 * @returns A `fetch` body.
 */
function toBodyInit(data: Blob | ArrayBuffer | Uint8Array | string): BodyInit {
    if (data instanceof Uint8Array) {
        return new Blob([Uint8Array.from(data)]);
    }

    return data;
}

/**
 * Merge two header collections.
 *
 * @param base - Original headers.
 * @param extra - Headers that take precedence over the original ones.
 * @returns A plain header record.
 */
function mergeHeaders(base: HeadersInit | undefined, extra: Record<string, string>): Headers {
    const headers = new Headers(base);

    for (const [name, value] of Object.entries(extra)) {
        headers.set(name, value);
    }

    return headers;
}

/**
 * Extract a file name from a `content-disposition` header.
 *
 * @param header - Raw header value.
 * @returns Decoded file name, or `null` when the header has no file name.
 */
function parseFileName(header: string | null): string | null {
    if (!header) {
        return null;
    }

    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (encoded?.[1]) {
        try {
            return decodeURIComponent(encoded[1]);
        } catch {
            return encoded[1];
        }
    }

    const plain = /filename="?([^";]+)"?/i.exec(header);
    return plain?.[1] ?? null;
}
