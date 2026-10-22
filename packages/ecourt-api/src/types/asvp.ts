/**
 * Document attached to an enforcement decision (постанова ВП).
 */
export interface ExecutiveDecisionDocumentDto {
    /** PDF document encoded as base64. */
    payload: string;
    /** Detached `.p7s` signature encoded as base64. */
    signature: string;
}

/**
 * Short enforcement decision returned in list responses.
 */
export interface ExecutiveDecisionList {
    /** Decision record identifier. */
    id: number;
    /** Date the record was created in eCourt (ISO 8601). */
    createdAt: string;
    /** Date of the decision (ISO 8601). */
    docAcceptDate?: string;
    /** Decision name. */
    docName?: string;
    /** Identifier of the enforcement document on the E-Cabinet side. */
    executiveId?: string;
    /** User role in the enforcement proceeding. */
    myRole: string;
    /** Name of the executor or the state enforcement service. */
    orgName?: string;
    /** Debt amount in UAH. */
    sumUah?: number;
    /** Identifier of the user requesting the data. */
    userId: string;
    /** Identifier of the enforcement document on the ASVP side. */
    vdStatementId: string;
    /** Enforcement proceeding identifier. */
    vpId: number;
    /** Enforcement proceeding number. */
    vpNum: string;
    /** Enforcement proceeding state identifier. */
    vpStateId: number;
}

/**
 * Full enforcement decision returned by identifier.
 */
export interface ExecutiveDecision extends ExecutiveDecisionList {
    /** Number of the cancelled decision. */
    docNumCanceled?: number;
    /** Decision number. */
    docNum?: number;
    /** Full name of the executor. */
    executor?: string;
    /** Executor phone number. */
    executorPhone?: string;
    /** Enforcement authority identifier. */
    orgId: number;
    /** Debt amount in the original currency. */
    sum?: number;
    /** Currency of {@link sum}. */
    sumCurrency?: string;
    /** Enforcement case number. */
    vdCaseNumber?: string;
    /** Enforcement document date (ISO 8601). */
    vdDate?: string;
    /** Enforcement document number. */
    vdNum?: string;
    /** Enforcement document state identifier. */
    vdStateId: number;
    /** Enforcement proceeding closing date (ISO 8601). */
    vpEndDate?: string;
    /** Reason for closing the enforcement proceeding. */
    vpEndReason?: string;
    /** Enforcement proceeding opening date (ISO 8601). */
    vpStartDate?: string;
    /** Enforcement proceeding state identifier. */
    vpStateId: number;
    /** Decision document and its signature. */
    document: ExecutiveDecisionDocumentDto;
}
