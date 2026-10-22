import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";
import type {
    PowerOfAttorney,
    PowerOfAttorneyPostDto,
    PowerOfAttorneyStatus,
    PowerOfAttorneyTargetType,
    PowerOfAttorneyType,
} from "../types/poa";
import { ReadonlyResource } from "./crud";

/**
 * Power of attorney resources.
 *
 * A power of attorney authorises a representative to act on behalf of a client
 * in court. Only powers of type `0` (power of attorney) can be registered
 * through the corporate API.
 */
export class PowerOfAttorneyResource {
    /** Power of attorney statuses (`/poa/poa-status`). */
    readonly statuses: ReadonlyResource<PowerOfAttorneyStatus>;
    /** Power of attorney types (`/poa/poa-type`). */
    readonly types: ReadonlyResource<PowerOfAttorneyType>;
    /** Power of attorney scopes (`/poa/poa-target-type`). */
    readonly targetTypes: ReadonlyResource<PowerOfAttorneyTargetType>;

    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
        this.statuses = new ReadonlyResource(transport, "/poa/poa-status");
        this.types = new ReadonlyResource(transport, "/poa/poa-type");
        this.targetTypes = new ReadonlyResource(transport, "/poa/poa-target-type");
    }

    /**
     * Submit a power of attorney for registration.
     *
     * @param body - Power of attorney data with uploaded file and signature.
     * @param options - Per-request options.
     */
    submit(body: PowerOfAttorneyPostDto, options?: EcourtRequestOptions): Promise<void> {
        return this.transport.postVoid("/poa/power-of-attorney", body, options);
    }

    /**
     * Retrieve powers of attorney.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated power of attorney list.
     */
    list(
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<PowerOfAttorney>> {
        return this.transport.get<ListResponse<PowerOfAttorney>>(
            "/poa/power-of-attorney",
            query,
            options,
        );
    }

    /**
     * Retrieve a power of attorney by identifier.
     *
     * @param id - Power of attorney identifier.
     * @param query - Optional field selection and joins.
     * @param options - Per-request options.
     * @returns The requested power of attorney.
     */
    get(
        id: string,
        query: SingleQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<PowerOfAttorney> {
        return this.transport.get<PowerOfAttorney>(
            `/poa/power-of-attorney/${encodeURIComponent(id)}`,
            query,
            options,
        );
    }

    /**
     * Revoke (delete) a power of attorney.
     *
     * @param id - Power of attorney identifier.
     * @param options - Per-request options.
     */
    revoke(id: string, options?: EcourtRequestOptions): Promise<void> {
        return this.transport.deleteVoid(
            `/poa/power-of-attorney/${encodeURIComponent(id)}`,
            options,
        );
    }
}
