/**
 * Common fields shared by all eCourt dictionary records.
 */
export interface DictionaryRecord {
    /** Numeric record identifier. */
    id: number;
    /** Creation date and time (ISO 8601). */
    createdAt?: string;
    /** Last update date and time (ISO 8601). */
    updatedAt?: string;
    /** Short code of the record. */
    code?: string;
    /** Display name of the record. */
    name?: string;
    /** Optional description or notes. */
    description?: string;
    /** Whether the record is active and can be used in new objects. */
    isActive?: boolean;
}

/**
 * Case category (Категорія справи).
 *
 * Categories form a hierarchy through {@link parentId} and {@link children}.
 */
export interface CaseCategory extends DictionaryRecord {
    /** Category code. */
    code: string;
    /** Category name. */
    name: string;
    /** Article of the procedural code associated with the category. */
    article?: string;
    /** Parent category identifier. */
    parentId?: number;
    /** Justice type identifier. */
    justiceTypeId?: number;
    /** Child categories. Included only with `join=children`. */
    children?: CaseCategory[];
    /** Parent category. Included only with `join=parent`. */
    parent?: CaseCategory;
    /** Justice type. Included only with `join=justiceType`. */
    justiceType?: JusticeType;
}

/**
 * Judge role in a case or proceeding (Роль судді у справі).
 */
export interface CaseJudgeRole extends DictionaryRecord {
    /** Role description. */
    description?: string;
}

/**
 * Type (role) of a case participant (Тип (роль) учасника справи).
 */
export interface CaseMemberRole extends DictionaryRecord {
    /** Role description. */
    description?: string;
    /**
     * Party type used by the Unified State Register of Court Decisions.
     *
     * @deprecated Kept for compatibility with older records.
     */
    partyType?: string;
    /**
     * Participant type code used by the Unified State Register of Court
     * Decisions.
     *
     * @deprecated Kept for compatibility with older records.
     */
    partyCode?: string;
}

/**
 * Case status (Стан розгляду справи).
 */
export interface CaseStatus extends DictionaryRecord {
    /** Status code. */
    code?: string;
    /** Status name. */
    name: string;
}

/**
 * Court or another judicial authority (Суд).
 */
export interface Court extends DictionaryRecord {
    /** Short court name. */
    shortName?: string;
    /** Court address. */
    address?: string;
    /** EDRPOU code. */
    edrpo?: string;
    /** Court e-mail address. */
    email?: string;
    /** Court phone number. */
    phone?: string;
    /** Court name in the genitive case. */
    name2?: string;
    /** Short court name in the genitive case. */
    shortName2?: string;
    /** Geographical latitude. */
    geoLat?: number;
    /** Geographical longitude. */
    geoLong?: number;
    /** Region identifier. */
    regionId?: number;
    /** Court type identifier. */
    courtTypeId?: number;
    /** Jurisdiction type identifier. */
    jurisdictionTypeId?: number;
    /** Appellate court identifier. */
    apelCourtId?: number;
    /** Region. Included only with `join=region`. */
    region?: Region;
    /** Court type. Included only with `join=courtType`. */
    courtType?: CourtType;
    /** Jurisdiction type. Included only with `join=jurisdictionType`. */
    jurisdictionType?: JurisdictionType;
    /** Appellate court. Included only with `join=apelCourt`. */
    apelCourt?: Court;
}

/**
 * Type of court or judicial authority (Тип суду).
 */
export interface CourtType extends DictionaryRecord {}

/**
 * Document category (Категорія документу).
 */
export interface DocCategory extends DictionaryRecord {}

/**
 * Document processing stage (Стадія документу).
 */
export interface DocStage extends DictionaryRecord {}

/**
 * Document processing state (Стан документу).
 */
export interface DocState extends DictionaryRecord {
    /** Whether this state represents a document processing error. */
    isErrState?: boolean;
    /** Whether this state is terminal and cannot be changed. */
    isTermState?: boolean;
    /** Identifier of the processing stage. */
    docStageId?: number;
    /** Processing stage. Included only with `join=docStage`. */
    docStage?: DocStage;
}

/**
 * Document type in court record keeping (Тип документу).
 */
export interface DocType extends DictionaryRecord {
    /** Document category identifier. */
    docCategoryId?: number;
    /** Document category. Included only with `join=docCategory`. */
    docCategory?: DocCategory;
}

/**
 * Court jurisdiction (Юрисдикція суду).
 */
export interface JurisdictionType extends DictionaryRecord {}

/**
 * Type of legal proceedings (Вид судочинства).
 */
export interface JusticeType extends DictionaryRecord {
    /** Jurisdiction type identifier. */
    jurisdictionTypeId?: number;
    /** Jurisdiction type. Included only with `join=jurisdictionType`. */
    jurisdictionType?: JurisdictionType;
}

/**
 * Proceeding result (Результат розгляду провадження).
 */
export interface ProcResult extends DictionaryRecord {}

/**
 * Proceeding stage (Стадія розгляду провадження).
 */
export interface ProcStage extends DictionaryRecord {}

/**
 * Proceeding status (Стан розгляду провадження).
 */
export interface ProcStatus extends DictionaryRecord {
    /** Identifier of the proceeding stage. */
    procStageId?: number;
    /** Proceeding stage. Included only with `join=procStage`. */
    procStage?: ProcStage;
}

/**
 * Region of a judicial authority (Регіон).
 */
export interface Region extends DictionaryRecord {}
