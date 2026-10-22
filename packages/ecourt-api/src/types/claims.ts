import type {
    CourtType,
    DictionaryRecord,
    DocType,
    JurisdictionType,
    JusticeType,
} from "./dictionaries";
import type { DocumentDto, DocumentFileDto } from "./documents";

/**
 * Claim submission category.
 *
 * The category is stored in the `ClaimType` dictionary and controls which
 * additional fields are required when a claim is submitted.
 *
 * - `1` — primary claim (a new case).
 * - `2` — procedural claim within an existing case.
 * - `3` — appeal.
 * - `4` — cassation.
 */
export type ClaimCategoryId = 1 | 2 | 3 | 4 | number;

/**
 * Claim type dictionary record (Тип заяви).
 */
export interface ClaimType extends DictionaryRecord {
    /** Claim type code. */
    code?: string;
    /** Claim type name. */
    name?: string;
    /** Claim submission category. See {@link ClaimCategoryId}. */
    claimCategoryId?: ClaimCategoryId;
    /** Justice type identifier. */
    justiceTypeId?: number;
    /** Jurisdiction type identifier. */
    jurisdictionTypeId?: number;
    /** Court type identifier. */
    courtTypeId?: number;
    /** Document type identifier. */
    docTypeId?: number;
    /** Justice type. Included only with `join=justiceType`. */
    justiceType?: JusticeType;
    /** Jurisdiction type. Included only with `join=jurisdictionType`. */
    jurisdictionType?: JurisdictionType;
    /** Court type. Included only with `join=courtType`. */
    courtType?: CourtType;
    /** Document type. Included only with `join=docType`. */
    docType?: DocType;
}

/**
 * Case participant data used when submitting a claim.
 */
export interface CaseMemberPostDto {
    /** Residential or registered address. */
    address?: string;
    /** Date of birth (natural persons only, ISO date). */
    birthDate?: string;
    /** Tax identifier (RNOKPP) or EDRPOU code. Required for the signer. */
    code?: string;
    /** Contact e-mail address. */
    email?: string;
    /** `true` when the person participates as a sole proprietor. */
    isFOP?: boolean;
    /** `true` for a legal entity, `false` for a natural person. */
    isLegal: boolean;
    /** Gender identifier: `1` male, `2` female. */
    genderId?: number;
    /** Participant role identifier from the `CaseMemberRole` dictionary. */
    memberRoleId: number;
    /** Full name (natural person) or name (legal entity). */
    name: string;
    /** Passport series and number or ID card number. */
    passport?: string;
    /** Contact phone number. */
    phone?: string;
}

/**
 * Claim payload accepted by `POST /api/v1/claims/claim`.
 *
 * Files referenced by {@link original} and {@link attachments} must be uploaded
 * to the storage module first (see `client.storage.upload` and
 * `client.storage.uploadSignature`).
 */
export interface ClaimPostDto {
    /** Attachments metadata. */
    attachments?: DocumentFileDto[];
    /** Claim type identifier from the `ClaimType` dictionary. */
    claimTypeId: number;
    /** Court identifier from the `Court` dictionary. */
    courtId: number;
    /** Criminal proceeding number in the Unified Register of Pre-trial Investigations. */
    criminalProcNum?: string;
    /** Short description of the claim subject. */
    description: string;
    /** Original claim file metadata. */
    original: DocumentFileDto;
    /** Outgoing date and time in the client system (ISO 8601). */
    outDate?: string;
    /** Outgoing document number in the client system. */
    outNum?: string;
    /** Identifier of the document being appealed. */
    parentId?: string;
    /** Case participants, including the signer and the client organisation. */
    participants: CaseMemberPostDto[];
    /** Proceeding identifier when the claim is submitted within a proceeding. */
    procId?: string;
    /** Client-side record identifier returned in processing tickets. */
    sourceId: string;
}

/**
 * Full claim information returned by the API.
 *
 * From the eCourt perspective a claim is a document, so it contains all
 * {@link DocumentDto} fields plus claim-specific attributes.
 */
export interface Claim extends DocumentDto {
    /** Claim type identifier. */
    claimTypeId?: number;
    /** Claim type. Included only with `join=claimType`. */
    claimType?: ClaimType;
}

/**
 * Document state identifiers used in claim processing tickets.
 *
 * These values mirror the `docstateid` attribute of {@link ClaimTicket}.
 *
 * | Value | Meaning |
 * | --- | --- |
 * | `-3` | Technical or data error |
 * | `-2` | Formal checks failed |
 * | `-1` | Deleted |
 * | `0` | Waiting for processing |
 * | `1` | Draft |
 * | `2` | Signing |
 * | `3` | Accepted by eCourt |
 * | `4` | Delivered to court |
 * | `5` | Sending error |
 * | `6` | Court reception error |
 * | `7` | Delivered, waiting for registration |
 * | `8` | Registration refused |
 * | `9` | Registration error |
 * | `10` | Registered in court |
 * | `11` | Received from the court case management system |
 * | `12` | Primary claim registered, proceeding opened |
 * | `14` | Secondary document registered |
 * | `17` | Hearing scheduled |
 * | `18` | Sent to parties |
 */
export type ClaimDocStateId = number;

/**
 * Ticket delivery state.
 */
export type ClaimTicketState = "UNREAD" | "READ";

/**
 * Signed claim processing ticket (квитанція).
 *
 * The ticket body is returned as a base64-encoded HTML file together with the
 * administrator's qualified electronic signature.
 */
export interface ClaimTicket {
    /** Unique ticket identifier. */
    id: string;
    /** Client identifier. */
    clientId?: string;
    /** User identifier. */
    userId?: string;
    /** Client-side claim identifier supplied in {@link ClaimPostDto.sourceId}. */
    sourceId?: string;
    /** Claim identifier assigned by eCourt. */
    docId?: string;
    /**
     * Claim state identifier. See {@link ClaimDocStateId} for known values.
     */
    docstateid?: ClaimDocStateId;
    /** Date and time when the state was set (ISO 8601). */
    createdAt?: string;
    /** Date and time when the state changed (ISO 8601). */
    updatedAt?: string;
    /** Service that created the ticket, e.g. `claimAcceptCron`. */
    updatedBy?: string;
    /** Ticket number. */
    ticketNum?: number;
    /** Ticket delivery state. */
    state?: ClaimTicketState;
    /** Short status text. */
    text?: string;
    /** Base64-encoded HTML body of the ticket with meta tags. */
    file?: string;
    /** MIME type of the ticket body. */
    fileType?: string;
    /** Base64-encoded `.p7s` signature of the ticket body. */
    sign?: string;
    /** MIME type of the signature file. */
    signType?: string;
}

/**
 * Ticket container returned by claim ticket list endpoints.
 *
 * The `data` attribute contains the signed ticket payload and `sign` contains
 * its signature.
 */
export interface ClaimTicketContainer {
    /** Ticket identifier. */
    id: string;
    /** Ticket delivery state. */
    state?: ClaimTicketState;
    /** Signed ticket data. */
    data?: string;
    /** Ticket signature. */
    sign?: string;
}

/**
 * Ticket delivery confirmation payload.
 */
export interface ClaimTicketConfirm {
    /** Ticket identifier. */
    id: string;
    /** Delivery confirmation state. */
    state: "CONFIRMED" | "UNCONFIRMED";
}
