/**
 * A value accepted by the `filter` and `or` query parameters.
 *
 * Arrays are serialized as a comma separated list and are used by operators
 * such as `$in`, `$notin` and `$between`.
 */
export type FilterScalar = string | number | boolean | null;

/**
 * Value accepted by a single filter condition.
 */
export type FilterValue = FilterScalar | readonly FilterScalar[];

/**
 * Operators supported by the `nestjsx/crud` request DSL used by the eCourt API.
 *
 * | Operator | SQL equivalent |
 * | --- | --- |
 * | `$eq` | `=` |
 * | `$ne` | `!=` |
 * | `$gt` / `$gte` | `>` / `>=` |
 * | `$lt` / `$lte` | `<` / `<=` |
 * | `$starts` / `$ends` / `$cont` | `LIKE` patterns |
 * | `$excl` | `NOT LIKE %value%` |
 * | `$in` / `$notin` | `IN` / `NOT IN` |
 * | `$isnull` / `$notnull` | `IS NULL` / `IS NOT NULL` |
 * | `$between` | `BETWEEN` |
 * | `*L` variants | case-insensitive comparisons |
 */
export type FilterOperator =
    | "$eq"
    | "$ne"
    | "$gt"
    | "$lt"
    | "$gte"
    | "$lte"
    | "$starts"
    | "$ends"
    | "$cont"
    | "$excl"
    | "$in"
    | "$notin"
    | "$isnull"
    | "$notnull"
    | "$between"
    | "$eqL"
    | "$neL"
    | "$startsL"
    | "$endsL"
    | "$contL"
    | "$exclL"
    | "$inL"
    | "$notinL";

/**
 * One condition passed through the `filter` or `or` query parameter.
 *
 * The eCourt API serializes this as `field||operator||value`.
 *
 * @example
 * ```ts
 * const condition: FilterSpec = {
 *   field: "regDate",
 *   operator: "$gte",
 *   value: "2024-01-01T00:00:00.000Z",
 * };
 * ```
 */
export interface FilterSpec {
    /** Name of the field, including a relation prefix when filtering a joined field. */
    field: string;
    /** Comparison operator. */
    operator: FilterOperator;
    /**
     * Comparison value. Omit it for `$isnull` and `$notnull`.
     *
     * `$in`, `$notin` and `$between` accept an array and serialize it as a
     * comma separated list.
     */
    value?: FilterValue;
}

/**
 * Sort direction accepted by the `sort` query parameter.
 */
export type SortOrder = "ASC" | "DESC";

/**
 * One sorting instruction passed through the `sort` query parameter.
 */
export interface SortSpec {
    /** Field to sort by. */
    field: string;
    /** Sort direction. Defaults to `ASC`. */
    order?: SortOrder;
}

/**
 * Relation included through the `join` query parameter.
 *
 * A relation can be a plain name (`"attachments"`) or an object that also
 * selects the fields returned for that relation.
 */
export type JoinSpec =
    | string
    | {
          /** Relation name. Nested relations use dot notation, e.g. `"case.members"`. */
          relation: string;
          /** Fields to return for the joined relation. */
          fields?: readonly string[];
      };

/**
 * Scalar value accepted inside a JSON `search` expression.
 */
export type SearchScalar = string | number | boolean | null;

/**
 * Object form of a field condition inside a JSON `search` expression.
 *
 * @example
 * ```ts
 * const condition: SearchCondition = { $or: { $isnull: true, $eq: "Superman" } };
 * ```
 */
export type SearchCondition = {
    readonly [Operator in FilterOperator]?: SearchScalar | readonly SearchScalar[];
};

/**
 * JSON search tree accepted by the `search` / `s` query parameter.
 *
 * The API supports arbitrary `$and` / `$or` nesting as well as field
 * conditions. A plain scalar field value is shorthand for `$eq`.
 *
 * @example
 * ```ts
 * const search: SearchNode = {
 *   $and: [{ isActive: true }, { createdAt: { $ne: "2008-10-01T17:04:32" } }],
 * };
 * ```
 */
export interface SearchNode {
    /** All nested expressions must match. */
    $and?: readonly SearchNode[];
    /** At least one nested expression must match. */
    $or?: readonly SearchNode[];
    /** Field name mapped to a condition, a scalar value or a nested search. */
    [field: string]:
        | SearchCondition
        | SearchNode
        | readonly SearchNode[]
        | SearchScalar
        | undefined;
}

/**
 * Query parameters accepted by list and single-record endpoints.
 *
 * The parameter names mirror the `nestjsx/crud` request DSL documented in the
 * eCourt API specification (section 3.2.4).
 */
export interface CrudQuery {
    /** Fields to include in the response. */
    fields?: readonly string[];
    /** Alias for {@link CrudQuery.fields}. */
    select?: readonly string[];
    /** JSON search expression (`s` and `search` are aliases). */
    search?: SearchNode;
    /** JSON search expression (`s` and `search` are aliases). */
    s?: SearchNode;
    /** Conditions combined with `AND`. */
    filters?: readonly FilterSpec[];
    /** Conditions combined with `OR` (and with `filters` using `OR`). */
    or?: readonly FilterSpec[];
    /** Related objects to include in the response. */
    joins?: readonly JoinSpec[];
    /** Sorting instructions. Multiple entries are supported. */
    sort?: readonly SortSpec[];
    /** Maximum number of records to return. */
    limit?: number;
    /** Number of records to skip. */
    offset?: number;
    /** Page number, used together with `limit`. */
    page?: number;
    /** HTTP cache flag or TTL, as supported by the API. */
    cache?: boolean | number;
}

/**
 * Query parameters accepted by single-record endpoints (`fields`, `join` and
 * `cache` only).
 */
export type SingleQuery = Pick<CrudQuery, "fields" | "select" | "joins" | "cache">;

/**
 * Standard paginated response returned by eCourt list endpoints.
 *
 * @typeParam T - Type of the records in the `data` array.
 */
export interface ListResponse<T> {
    /** Records returned for the current page. */
    data: T[];
    /** Number of records in `data`. */
    count: number;
    /** Total number of records matching the query. */
    total: number;
    /** Current page number (1-based). */
    page: number;
    /** Total number of pages. */
    pageCount: number;
}

/**
 * Error body returned by the API on `4xx` and `5xx` responses.
 */
export interface ApiErrorBody {
    /** HTTP status code. */
    statusCode?: number;
    /** Human-readable error message, or a list of validation messages. */
    message?: string | string[];
    /** Short error name, e.g. `"Bad Request"`. */
    error?: string;
    /** Additional endpoint-specific information. */
    [key: string]: unknown;
}

/**
 * String literal union that still accepts future values without losing
 * autocompletion for the known ones.
 */
export type LiteralUnion<T extends string> = T | (string & {});
