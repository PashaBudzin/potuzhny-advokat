import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";

/**
 * Read-only CRUD resource exposed by the eCourt API.
 *
 * @typeParam T - Object type returned by the resource.
 */
export class ReadonlyResource<T> {
    /** Low-level transport used to perform requests. */
    protected readonly transport: ApiTransport;
    /** Resource path relative to the API prefix. */
    protected readonly path: string;

    /**
     * @param transport - Transport used to perform requests.
     * @param path - Resource path relative to the API prefix.
     */
    constructor(transport: ApiTransport, path: string) {
        this.transport = transport;
        this.path = path;
    }

    /**
     * Retrieve a list of objects.
     *
     * @param query - CRUD query (fields, filters, sorting, pagination, joins).
     * @param options - Per-request options.
     * @returns Paginated list of objects.
     */
    list(query: CrudQuery = {}, options?: EcourtRequestOptions): Promise<ListResponse<T>> {
        return this.transport.get<ListResponse<T>>(this.path, query, options);
    }

    /**
     * Retrieve a single object by identifier.
     *
     * @param id - Object identifier.
     * @param query - Optional field selection and joins.
     * @param options - Per-request options.
     * @returns The requested object.
     */
    get(id: string | number, query: SingleQuery = {}, options?: EcourtRequestOptions): Promise<T> {
        return this.transport.get<T>(
            `${this.path}/${encodeURIComponent(String(id))}`,
            query,
            options,
        );
    }
}
