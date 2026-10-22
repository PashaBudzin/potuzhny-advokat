import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse } from "../types/common";
import type {
    Case,
    CaseJudge,
    CaseMember,
    Document,
    DocumentFileDto,
    Proceeding,
    Trial,
} from "../types/documents";
import { ReadonlyResource } from "./crud";

/**
 * Read-only court data resources.
 *
 * Data is synchronized from the court's case management system and cannot be
 * modified through the corporate API. Use `client.claims` or
 * `client.partyDocs` to submit documents.
 */
export class DataResource {
    /** Court documents (`/data/document`). */
    readonly documents: ReadonlyResource<Document>;
    /** Court cases (`/data/case`). */
    readonly cases: ReadonlyResource<Case>;
    /** Proceedings (`/data/proceeding`). */
    readonly proceedings: ReadonlyResource<Proceeding>;
    /** Court hearings (`/data/trial`). */
    readonly trials: ReadonlyResource<Trial>;

    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
        this.documents = new ReadonlyResource(transport, "/data/document");
        this.cases = new ReadonlyResource(transport, "/data/case");
        this.proceedings = new ReadonlyResource(transport, "/data/proceeding");
        this.trials = new ReadonlyResource(transport, "/data/trial");
    }

    /**
     * Retrieve attachments of a court document.
     *
     * @param docId - Document identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated attachment list.
     */
    listDocumentAttachments(
        docId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<DocumentFileDto>> {
        return this.transport.get<ListResponse<DocumentFileDto>>(
            `/data/document/${encodeURIComponent(docId)}/attachments`,
            query,
            options,
        );
    }

    /**
     * Retrieve documents of a case.
     *
     * @param caseId - Case identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated document list.
     */
    listCaseDocuments(
        caseId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<Document>> {
        return this.transport.get<ListResponse<Document>>(
            `/data/case/${encodeURIComponent(caseId)}/documents`,
            query,
            options,
        );
    }

    /**
     * Retrieve proceedings of a case.
     *
     * @param caseId - Case identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated proceeding list.
     */
    listCaseProceedings(
        caseId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<Proceeding>> {
        return this.transport.get<ListResponse<Proceeding>>(
            `/data/case/${encodeURIComponent(caseId)}/proceedings`,
            query,
            options,
        );
    }

    /**
     * Retrieve participants of a case.
     *
     * @param caseId - Case identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated participant list.
     */
    listCaseMembers(
        caseId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<CaseMember>> {
        return this.transport.get<ListResponse<CaseMember>>(
            `/data/case/${encodeURIComponent(caseId)}/members`,
            query,
            options,
        );
    }

    /**
     * Retrieve judges of a case.
     *
     * @param caseId - Case identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated judge list.
     */
    listCaseJudges(
        caseId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<CaseJudge>> {
        return this.transport.get<ListResponse<CaseJudge>>(
            `/data/case/${encodeURIComponent(caseId)}/judges`,
            query,
            options,
        );
    }

    /**
     * Retrieve documents of a proceeding.
     *
     * @param procId - Proceeding identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated document list.
     */
    listProceedingDocuments(
        procId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<Document>> {
        return this.transport.get<ListResponse<Document>>(
            `/data/proceeding/${encodeURIComponent(procId)}/documents`,
            query,
            options,
        );
    }

    /**
     * Retrieve participants of a proceeding.
     *
     * @param procId - Proceeding identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated participant list.
     */
    listProceedingMembers(
        procId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<CaseMember>> {
        return this.transport.get<ListResponse<CaseMember>>(
            `/data/proceeding/${encodeURIComponent(procId)}/members`,
            query,
            options,
        );
    }

    /**
     * Retrieve judges of a proceeding.
     *
     * @param procId - Proceeding identifier.
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated judge list.
     */
    listProceedingJudges(
        procId: string,
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<CaseJudge>> {
        return this.transport.get<ListResponse<CaseJudge>>(
            `/data/proceeding/${encodeURIComponent(procId)}/judges`,
            query,
            options,
        );
    }
}
