import type { ApiTransport } from "../internal";
import type {
    CaseCategory,
    CaseJudgeRole,
    CaseMemberRole,
    CaseStatus,
    Court,
    CourtType,
    DocCategory,
    DocStage,
    DocState,
    DocType,
    JurisdictionType,
    JusticeType,
    ProcResult,
    ProcStage,
    ProcStatus,
    Region,
} from "../types/dictionaries";
import { ReadonlyResource } from "./crud";

/**
 * Dictionary resources.
 *
 * Dictionaries are reference data used by other eCourt modules. The corporate
 * API exposes them as read-only resources: records are maintained by eCourt
 * administrators and cannot be created or changed by API clients.
 */
export class DictionariesResource {
    /** Case categories (`/dictionaries/case-category`). */
    readonly caseCategories: ReadonlyResource<CaseCategory>;
    /** Judge roles in a case (`/dictionaries/case-judge-role`). */
    readonly caseJudgeRoles: ReadonlyResource<CaseJudgeRole>;
    /** Case participant roles (`/dictionaries/case-member-role`). */
    readonly caseMemberRoles: ReadonlyResource<CaseMemberRole>;
    /** Case statuses (`/dictionaries/case-status`). */
    readonly caseStatuses: ReadonlyResource<CaseStatus>;
    /** Courts (`/dictionaries/court`). */
    readonly courts: ReadonlyResource<Court>;
    /** Court types (`/dictionaries/court-type`). */
    readonly courtTypes: ReadonlyResource<CourtType>;
    /** Document categories (`/dictionaries/doc-category`). */
    readonly docCategories: ReadonlyResource<DocCategory>;
    /** Document processing stages (`/dictionaries/doc-stage`). */
    readonly docStages: ReadonlyResource<DocStage>;
    /** Document processing states (`/dictionaries/doc-state`). */
    readonly docStates: ReadonlyResource<DocState>;
    /** Document types (`/dictionaries/doc-type`). */
    readonly docTypes: ReadonlyResource<DocType>;
    /** Jurisdiction types (`/dictionaries/jurisdiction-type`). */
    readonly jurisdictionTypes: ReadonlyResource<JurisdictionType>;
    /** Justice types (`/dictionaries/justice-type`). */
    readonly justiceTypes: ReadonlyResource<JusticeType>;
    /** Proceeding results (`/dictionaries/proc-result`). */
    readonly procResults: ReadonlyResource<ProcResult>;
    /** Proceeding stages (`/dictionaries/proc-stage`). */
    readonly procStages: ReadonlyResource<ProcStage>;
    /** Proceeding statuses (`/dictionaries/proc-status`). */
    readonly procStatuses: ReadonlyResource<ProcStatus>;
    /** Regions (`/dictionaries/region`). */
    readonly regions: ReadonlyResource<Region>;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.caseCategories = new ReadonlyResource(transport, "/dictionaries/case-category");
        this.caseJudgeRoles = new ReadonlyResource(transport, "/dictionaries/case-judge-role");
        this.caseMemberRoles = new ReadonlyResource(transport, "/dictionaries/case-member-role");
        this.caseStatuses = new ReadonlyResource(transport, "/dictionaries/case-status");
        this.courts = new ReadonlyResource(transport, "/dictionaries/court");
        this.courtTypes = new ReadonlyResource(transport, "/dictionaries/court-type");
        this.docCategories = new ReadonlyResource(transport, "/dictionaries/doc-category");
        this.docStages = new ReadonlyResource(transport, "/dictionaries/doc-stage");
        this.docStates = new ReadonlyResource(transport, "/dictionaries/doc-state");
        this.docTypes = new ReadonlyResource(transport, "/dictionaries/doc-type");
        this.jurisdictionTypes = new ReadonlyResource(transport, "/dictionaries/jurisdiction-type");
        this.justiceTypes = new ReadonlyResource(transport, "/dictionaries/justice-type");
        this.procResults = new ReadonlyResource(transport, "/dictionaries/proc-result");
        this.procStages = new ReadonlyResource(transport, "/dictionaries/proc-stage");
        this.procStatuses = new ReadonlyResource(transport, "/dictionaries/proc-status");
        this.regions = new ReadonlyResource(transport, "/dictionaries/region");
    }
}
