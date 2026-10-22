import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";
import type { ExecutiveDecision, ExecutiveDecisionList } from "../types/asvp";

/**
 * Enforcement proceeding document resources (АСВП).
 *
 * Documents are received from the Automated System of Enforcement Proceedings
 * and are read-only in the corporate API.
 */
export class AsvpResource {
    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
    }

    /**
     * Retrieve enforcement decisions.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated list of enforcement decisions.
     */
    list(
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<ExecutiveDecisionList>> {
        return this.transport.get<ListResponse<ExecutiveDecisionList>>(
            "/asvp/decisions",
            query,
            options,
        );
    }

    /**
     * Retrieve an enforcement decision by identifier.
     *
     * @param id - Enforcement decision identifier.
     * @param query - Optional field selection.
     * @param options - Per-request options.
     * @returns The full enforcement decision, including the PDF and signature.
     */
    get(
        id: string | number,
        query: SingleQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ExecutiveDecision> {
        return this.transport.get<ExecutiveDecision>(
            `/asvp/decisions/${encodeURIComponent(String(id))}`,
            query,
            options,
        );
    }
}
