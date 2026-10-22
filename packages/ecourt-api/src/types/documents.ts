import type {
    CaseCategory,
    CaseJudgeRole,
    CaseMemberRole,
    CaseStatus,
    Court,
    DocCategory,
    DocState,
    DocType,
    JusticeType,
    ProcResult,
    ProcStage,
    ProcStatus,
} from "./dictionaries";

/**
 * Digital signature attached to a document file.
 */
export interface DocumentFileSignature {
    /** Storage link of the `.p7s` signature file. */
    link: string;
    /** MIME type of the signature file, usually `application/pkcs7-signature`. */
    type?: string;
}

/**
 * Metadata of an original document file or one of its attachments.
 */
export interface DocumentFileDto {
    /** Short description of the file. */
    description?: string;
    /** Storage link of the file. */
    link: string;
    /** MIME type of the file, e.g. `application/pdf`. */
    type: string;
    /** Digital signatures attached to the file. */
    signatures?: DocumentFileSignature[];
}

/**
 * Registration data of a document in the court's case management system
 * (АСДС).
 */
export interface DocumentAsdsLink {
    /** eCourt document identifier. */
    docId: string;
    /** Court code in the Unified State Register of Court Decisions. */
    courtCode?: string;
    /** Court name. */
    courtName?: string;
    /** Database identifier in the court's case management system. */
    dbid: number;
    /** Document identifier in the court's case management system. */
    id: number;
}

/**
 * Base document structure used by court documents, party documents, claims
 * and other document-like objects.
 */
export interface DocumentDto {
    /** eCourt document identifier. */
    id: string;
    /** File attachments. Included only with `join=attachments`. */
    attachments?: DocumentFileDto[];
    /** Case the document belongs to. Included only with `join=case`. */
    case?: Case;
    /** Case identifier. */
    caseId?: string;
    /** Case number. */
    caseNum?: string;
    /** Court where the document was submitted or issued. Included only with `join=court`. */
    court?: Court;
    /** Court code in the Unified State Register of Court Decisions. */
    courtCode?: string;
    /** Court identifier. */
    courtId: number;
    /** Court name. */
    courtName?: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Criminal proceeding number in the Unified Register of Pre-trial Investigations. */
    criminalProcNum?: string;
    /** Short description of the document subject. */
    description: string;
    /** Document category. Included only with `join=docCategory`. */
    docCategory?: DocCategory;
    /** Document category identifier. */
    docCategoryId?: number;
    /** Document state. Included only with `join=docState`. */
    docState?: DocState;
    /** Document state identifier. */
    docStateId?: number;
    /** Document type. Included only with `join=docType`. */
    docType?: DocType;
    /** Document type identifier. */
    docTypeId?: number;
    /** Issuer name (person or legal entity). */
    issuer?: string;
    /** Issuer tax identifier or passport number. */
    issuerCode?: string;
    /** Original file metadata. */
    original?: DocumentFileDto;
    /** Outgoing date and time (ISO 8601). */
    outDate?: string;
    /** Outgoing document number. */
    outNum?: string;
    /** Parent document. Included only with `join=parent`. */
    parent?: DocumentDto;
    /** Parent document identifier. */
    parentId?: string;
    /** Proceeding the document belongs to. Included only with `join=proceeding`. */
    proceeding?: Proceeding;
    /** Proceeding identifier. */
    procId?: string;
    /** Proceeding number. */
    procNum?: string;
    /** Registration date and time in court (ISO 8601). */
    regDate?: string;
    /** Registration number in court. */
    regNum?: string;
    /** Informational list of signer names. */
    signers?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
}

/**
 * Court document, including procedural documents, executive documents,
 * technological documents and summonses.
 */
export interface Document extends DocumentDto {
    /** Registration data in the court's case management system. Included only with `join=asdsLink`. */
    asdsLink?: DocumentAsdsLink;
    /** Date the court decision entered into legal force (ISO 8601). */
    dateOfForce?: string;
}

/**
 * Court case (Справа).
 */
export interface Case {
    /** eCourt case identifier. */
    id: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Case number. */
    caseNum: string;
    /** Criminal proceeding number in the Unified Register of Pre-trial Investigations. */
    criminalProcNum?: string;
    /** Court identifier. */
    courtId: number;
    /** Case status identifier. */
    caseStatusId: number;
    /** Identifier of the document that initiated the case. */
    initialDocumentId?: string | null;
    /** Court. Included only with `join=court`. */
    court?: Court;
    /** Case status. Included only with `join=caseStatus`. */
    caseStatus?: CaseStatus;
    /** Initiating document. Included only with `join=initialDocument`. */
    initialDocument?: DocumentDto;
    /** Proceedings. Included only with `join=proceedings`. */
    proceedings?: Proceeding[];
    /** Case participants. Included only with `join=members`. */
    members?: CaseMember[];
    /** Case judges. Included only with `join=judges`. */
    judges?: CaseJudge[];
    /** Case documents. Included only with `join=documents`. */
    documents?: DocumentDto[];
    /** Date of the first document in the case (ISO date). */
    firstDocDate?: string;
    /** Date of the last document in the case (ISO date). */
    lastDocDate?: string;
}

/**
 * Proceeding within a court case (Провадження).
 */
export interface Proceeding {
    /** eCourt proceeding identifier. */
    id: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Case category code. */
    caseCategoryCode?: string;
    /** Case identifier. */
    caseId: string;
    /** Proceeding closing date (ISO date). */
    closeDate?: string;
    /** Court identifier. */
    courtId: number;
    /** Court fee amount. */
    courtTaxSum?: string;
    /** Short description of the proceeding subject. */
    description: string;
    /** Date of the first document in the proceeding (ISO date). */
    firstDocDate?: string;
    /** Date of the last document in the proceeding (ISO date). */
    lastDocDate?: string;
    /** Justice type identifier. */
    justiceTypeId?: number;
    /** Whether the session is closed. */
    isClosedSession?: boolean;
    /** Proceeding court type identifier. */
    procCourtTypeId?: number;
    /** Proceeding date (ISO date). */
    procDate?: string;
    /** Proceeding number. */
    procNum: string;
    /** Proceeding result identifier. */
    procResultId?: number;
    /** Proceeding status identifier. */
    procStatusId?: number;
    /** Case. Included only with `join=case`. */
    case?: Case;
    /** Court. Included only with `join=court`. */
    court?: Court;
    /** Proceeding status. Included only with `join=procStatus`. */
    procStatus?: ProcStatus;
    /** Proceeding result. Included only with `join=procResult`. */
    procResult?: ProcResult;
    /** Justice type. Included only with `join=justiceType`. */
    justiceType?: JusticeType;
    /** Case category. Included only with `join=caseCategory`. */
    caseCategory?: CaseCategory;
    /** Case participants. Included only with `join=members`. */
    members?: CaseMember[];
    /** Proceeding judges. Included only with `join=judges`. */
    judges?: CaseJudge[];
    /** Proceeding documents. Included only with `join=documents`. */
    documents?: DocumentDto[];
    /** Proceeding stage. Included only with `join=procStage`. */
    procStage?: ProcStage;
}

/**
 * Case participant (Учасник справи).
 */
export interface CaseMember {
    /** eCourt participant identifier. */
    id: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Whether the record is active. */
    isActive?: boolean;
    /** `true` for a legal entity, `false` for a natural person. */
    isLegal: boolean;
    /** `true` when the person participates as a sole proprietor. */
    isFOP?: boolean;
    /** Full name (natural person) or name (legal entity). */
    name: string;
    /** Tax identifier (RNOKPP) or EDRPOU code. */
    code: string;
    /** Residential or registered address. */
    address: string;
    /** Date of birth (natural persons only, ISO date). */
    birthDate?: string;
    /** Gender identifier: `1` male, `2` female. */
    genderId?: number;
    /** Passport series and number or ID card number. */
    passport?: string;
    /** Contact phone number. */
    phone?: string;
    /** Contact e-mail address. */
    email?: string;
    /** Case identifier. */
    caseId: string;
    /** Proceeding identifier. */
    procId: string;
    /** Participant role identifier. */
    memberRoleId: number;
    /** Case. Included only with `join=case`. */
    case?: Case;
    /** Proceeding. Included only with `join=proceeding`. */
    proceeding?: Proceeding;
    /** Participant role. Included only with `join=memberRole`. */
    memberRole?: CaseMemberRole;
}

/**
 * Judge assigned to a case (Суддя по справі).
 */
export interface CaseJudge {
    /** eCourt judge record identifier. */
    id: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Whether the record is active. */
    isActive?: boolean;
    /** Judge full name. */
    name: string;
    /** Case identifier. */
    caseId: string;
    /** Proceeding identifier. */
    procId: string;
    /** Judge role identifier. */
    judgeRoleId: string;
    /** Case. Included only with `join=case`. */
    case?: Case;
    /** Proceeding. Included only with `join=proceeding`. */
    proceeding?: Proceeding;
    /** Judge role. Included only with `join=judgeRole`. */
    judgeRole?: CaseJudgeRole;
}

/**
 * Court hearing (судове засідання).
 */
export interface Trial {
    /** eCourt hearing identifier. */
    id: string;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Whether the hearing is active (`false` means cancelled). */
    isActive?: boolean;
    /** Court identifier. */
    courtId: number;
    /** Hearing address. */
    address: string;
    /** Hearing hall or room. */
    hall: string;
    /** Short description of the case subject. */
    description?: string;
    /** Hearing date and time (ISO 8601). */
    trialDate?: string;
    /** Date of the document that scheduled the hearing (ISO 8601). */
    docDate?: string;
    /** Case identifier. */
    caseId: string;
    /** Unique case number. */
    caseNum: string;
    /** Proceeding identifier. */
    procId: string;
    /** Proceeding number. */
    procNum?: string;
    /** Court. Included only with `join=court`. */
    court?: Court;
    /** Case. Included only with `join=case`. */
    case?: Case;
    /** Proceeding. Included only with `join=proceeding`. */
    proceeding?: Proceeding;
}
