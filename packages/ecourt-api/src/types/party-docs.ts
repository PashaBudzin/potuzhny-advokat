import type { CaseMemberPostDto } from "./claims";
import type { DocumentFileDto } from "./documents";

/**
 * Payload for sending a document to the other parties of a case.
 */
export interface PartyDocPostDto {
    /** Attachments metadata. */
    attachments?: DocumentFileDto[];
    /** Court identifier. */
    courtId?: number;
    /** Criminal proceeding number in the Unified Register of Pre-trial Investigations. */
    criminalProcNum?: string;
    /** Short description of the document subject. */
    description: string;
    /** Original document file metadata. */
    original: DocumentFileDto;
    /** Outgoing date and time in the client system (ISO 8601). */
    outDate?: string;
    /** Outgoing document number in the client system. */
    outNum?: string;
    /** Identifier of the document being appealed. */
    parentId?: string;
    /** Case participants, including the person signing the document. */
    participants: CaseMemberPostDto[];
    /** Proceeding identifier when the document is sent within a proceeding. */
    procId?: string;
    /** Client-side record identifier returned in processing tickets. */
    sourceId: string;
}

/**
 * Ticket sent to one case participant after a party document is delivered.
 */
export interface CaseMemberTicketDto {
    /** Participant code. */
    code: string;
    /** Storage link of the PDF delivery ticket. */
    ticketLink: string;
    /** Storage link of the ticket signature (`.p7s`). */
    ticketSign: string;
}

/**
 * Result of sending a document to case participants.
 */
export interface PartyDocPostResultDto {
    /** Identifier of the created party document. */
    docId: string;
    /** Delivery tickets sent to the participants. */
    sentTo: CaseMemberTicketDto[];
}

/**
 * Parameters for checking whether a person has an electronic cabinet.
 */
export interface CabinetCheckParams {
    /** Tax identifier (RNOKPP) or EDRPOU code. */
    code: string;
    /** Request a PDF certificate confirming the result. */
    issueDoc?: boolean;
}

/**
 * Result of checking whether a person has an electronic cabinet.
 */
export interface CabinetCheckResult {
    /** Tax identifier (RNOKPP) or EDRPOU code that was checked. */
    code: string;
    /** Date and time of the response (ISO 8601). */
    createdAt: string;
    /** `true` when the cabinet exists. */
    isFound: boolean;
    /** `true` when the checked person is a legal entity. */
    isLegal: boolean;
    /** Date the cabinet was created, or `null` when it does not exist. */
    linkedAt?: string | null;
    /** Full name or organisation name, or `null` when the cabinet does not exist. */
    name?: string | null;
    /**
     * Response identifier.
     *
     * The SRS table uses `reqid`, while examples use `reqId`. Both spellings
     * are exposed so responses from either API version remain usable.
     */
    reqid?: string | number;
    /** Response identifier (camel-case spelling used in the SRS examples). */
    reqId?: string | number;
    /** Base64-encoded PDF certificate. Present when `issueDoc` is `true`. */
    doc?: string;
    /** Base64-encoded `.p7s` signature of the certificate. Present when `issueDoc` is `true`. */
    docSign?: string;
}
