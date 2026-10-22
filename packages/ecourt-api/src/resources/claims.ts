import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";
import type {
    Claim,
    ClaimPostDto,
    ClaimTicketConfirm,
    ClaimTicketContainer,
    ClaimType,
} from "../types/claims";
import { ReadonlyResource } from "./crud";

/**
 * Claim resources.
 *
 * A claim (заява) is a document submitted to a court. Claims are queued for
 * processing; their progress is reported through signed tickets.
 */
export class ClaimsResource {
    /** Claim type dictionary (`/claims/type`). */
    readonly types: ReadonlyResource<ClaimType>;

    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
        this.types = new ReadonlyResource(transport, "/claims/type");
    }

    /**
     * Submit a claim to the processing queue.
     *
     * All files referenced by the claim must be uploaded to the storage first.
     *
     * @param body - Claim data.
     * @param options - Per-request options.
     * @returns The created claim.
     */
    submit(body: ClaimPostDto, options?: EcourtRequestOptions): Promise<Claim> {
        return this.transport.post<Claim>("/claims/claim", body, options);
    }

    /**
     * Submit several claims in one request.
     *
     * @param body - Claim data array.
     * @param options - Per-request options.
     * @returns The created claims.
     */
    submitMany(body: ClaimPostDto[], options?: EcourtRequestOptions): Promise<Claim[]> {
        return this.transport.post<Claim[]>("/claims/claim/bulk", body, options);
    }

    /**
     * Retrieve claims accepted by eCourt.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated claim list.
     */
    list(query: CrudQuery = {}, options?: EcourtRequestOptions): Promise<ListResponse<Claim>> {
        return this.transport.get<ListResponse<Claim>>("/claims/claim", query, options);
    }

    /**
     * Retrieve a claim by identifier.
     *
     * @param id - Claim identifier.
     * @param query - Optional field selection and joins.
     * @param options - Per-request options.
     * @returns The requested claim.
     */
    get(id: string, query: SingleQuery = {}, options?: EcourtRequestOptions): Promise<Claim> {
        return this.transport.get<Claim>(`/claims/claim/${encodeURIComponent(id)}`, query, options);
    }

    /**
     * Retrieve unread claim tickets.
     *
     * @param query - CRUD query. Use `filter=state||$eq||UNREAD` to fetch only
     * undelivered tickets.
     * @param options - Per-request options.
     * @returns Paginated ticket containers.
     */
    listTickets(
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<ClaimTicketContainer>> {
        return this.transport.get<ListResponse<ClaimTicketContainer>>(
            "/claims/ticket",
            query,
            options,
        );
    }

    /**
     * Retrieve tickets for a specific claim.
     *
     * @param claimId - Claim identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated ticket containers.
     */
    listClaimTickets(
        claimId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<ClaimTicketContainer>> {
        return this.transport.get<ListResponse<ClaimTicketContainer>>(
            `/claims/claim/${encodeURIComponent(claimId)}/tickets`,
            query,
            options,
        );
    }

    /**
     * Retrieve a single ticket by identifier.
     *
     * @param id - Ticket identifier.
     * @param query - Optional field selection.
     * @param options - Per-request options.
     * @returns The signed ticket container.
     */
    getTicket(
        id: string,
        query: SingleQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ClaimTicketContainer> {
        return this.transport.get<ClaimTicketContainer>(
            `/claims/ticket/${encodeURIComponent(id)}`,
            query,
            options,
        );
    }

    /**
     * Confirm delivery of one or more tickets.
     *
     * @param tickets - Ticket delivery confirmations.
     * @param options - Per-request options.
     */
    confirmTickets(tickets: ClaimTicketConfirm[], options?: EcourtRequestOptions): Promise<void> {
        return this.transport.postVoid("/claims/ticket-confirm", tickets, options);
    }
}
