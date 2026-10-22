/**
 * File metadata returned after uploading a file to the eCourt storage.
 */
export interface UploadedFile {
    /** Storage path (link) of the uploaded file. */
    fileLink: string;
    /** MIME type of the uploaded file. */
    contentType: string;
    /** File size in bytes. */
    fileSize?: number;
    /** File hash. */
    hash?: string;
    /** Hash algorithm, e.g. `md5`. */
    hashType?: string;
    /** Internal storage identifier of the file. */
    id: string;
}

/**
 * Downloaded file contents and response metadata.
 *
 * The body is returned as bytes rather than a `Blob` so the same type works in
 * Node.js, Bun, browsers and edge runtimes.
 */
export interface DownloadedFile {
    /** Raw file bytes. */
    bytes: Uint8Array;
    /** MIME type from the `content-type` response header. */
    contentType: string | null;
    /** File size in bytes from the `content-length` response header. */
    contentLength: number | null;
    /** File name parsed from the `content-disposition` response header. */
    fileName: string | null;
    /** Raw `content-disposition` response header. */
    contentDisposition: string | null;
}
