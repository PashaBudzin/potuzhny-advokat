import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";
import type { DocumentDto, DocumentFileDto } from "../types/documents";
import type {
    CabinetCheckParams,
    CabinetCheckResult,
    PartyDocPostDto,
    PartyDocPostResultDto,
} from "../types/party-docs";

/**
 * Party document resources.
 *
 * Party documents are sent by one party of a case to the other participants.
 * Each recipient with an electronic cabinet receives a signed PDF ticket that
 * can be downloaded from the storage.
 */
export class PartyDocsResource {
    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
    }

    /**
     * Send a document and its attachments to the other parties.
     *
     * @param body - Party document data.
     * @param options - Per-request options.
     * @returns The created document identifier and delivery tickets.
     */
    submit(body: PartyDocPostDto, options?: EcourtRequestOptions): Promise<PartyDocPostResultDto> {
        return this.transport.post<PartyDocPostResultDto>("/party-docs/document", body, options);
    }

    /**
     * Retrieve party documents.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated document list.
     */
    list(
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<DocumentDto>> {
        return this.transport.get<ListResponse<DocumentDto>>(
            "/party-docs/document",
            query,
            options,
        );
    }

    /**
     * Retrieve a party document by identifier.
     *
     * @param id - Document identifier.
     * @param query - Optional field selection and joins.
     * @param options - Per-request options.
     * @returns The requested document.
     */
    get(id: string, query: SingleQuery = {}, options?: EcourtRequestOptions): Promise<DocumentDto> {
        return this.transport.get<DocumentDto>(
            `/party-docs/document/${encodeURIComponent(id)}`,
            query,
            options,
        );
    }

    /**
     * Retrieve attachments of a party document.
     *
     * @param docId - Document identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated attachment list.
     */
    listAttachments(
        docId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<DocumentFileDto>> {
        return this.transport.get<ListResponse<DocumentFileDto>>(
            `/party-docs/document/${encodeURIComponent(docId)}/attachments`,
            query,
            options,
        );
    }

    /**
     * Retrieve the original file of a party document.
     *
     * @param docId - Document identifier.
     * @param query - Optional field selection.
     * @param options - Per-request options.
     * @returns Original file metadata.
     */
    getOriginal(
        docId: string,
        query: SingleQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<DocumentFileDto> {
        return this.transport.get<DocumentFileDto>(
            `/party-docs/document/${encodeURIComponent(docId)}/original`,
            query,
            options,
        );
    }

    /**
     * Check whether a person or organisation has an electronic cabinet.
     *
     * @param params - Tax identifier and optional certificate request.
     * @param options - Per-request options.
     * @returns Cabinet availability information.
     */
    checkCabinet(
        params: CabinetCheckParams,
        options?: EcourtRequestOptions,
    ): Promise<CabinetCheckResult> {
        const query = new URLSearchParams({ code: params.code });

        if (params.issueDoc !== undefined) {
            query.set("issueDoc", String(params.issueDoc));
        }

        return this.transport.request<CabinetCheckResult>("/party-docs/check-cabinet", {
            ...options,
            query,
        });
    }
}
