import type { CrudQuery, FilterSpec, JoinSpec, SortSpec } from "./types/common";

/**
 * Serialize one filter condition into the eCourt `field||operator||value`
 * format.
 *
 * @param filter - Filter condition to serialize.
 * @returns The serialized filter value.
 */
export function serializeFilter(filter: FilterSpec): string {
    const prefix = `${filter.field}||${filter.operator}`;

    if (filter.value === undefined) {
        return prefix;
    }

    if (Array.isArray(filter.value)) {
        return `${prefix}||${filter.value.map(String).join(",")}`;
    }

    return `${prefix}||${String(filter.value)}`;
}

/**
 * Serialize one sort instruction into the eCourt `field,ORDER` format.
 *
 * @param sort - Sort instruction to serialize.
 * @returns The serialized sort value.
 */
export function serializeSort(sort: SortSpec): string {
    return `${sort.field},${sort.order ?? "ASC"}`;
}

/**
 * Serialize one join instruction into the eCourt `relation||field1,field2`
 * format.
 *
 * @param join - Join instruction to serialize.
 * @returns The serialized join value.
 */
export function serializeJoin(join: JoinSpec): string {
    if (typeof join === "string") {
        return join;
    }

    if (!join.fields || join.fields.length === 0) {
        return join.relation;
    }

    return `${join.relation}||${join.fields.join(",")}`;
}

/**
 * Convert a typed CRUD query into the `URLSearchParams` consumed by the API.
 *
 * The function is exported so callers can inspect or extend a query before it
 * is sent. Most users should pass {@link CrudQuery} to resource methods
 * directly instead.
 *
 * @param query - Typed query object or already prepared search parameters.
 * @returns Search parameters ready to be appended to a request URL.
 */
export function toSearchParams(query?: CrudQuery | URLSearchParams): URLSearchParams {
    if (!query) {
        return new URLSearchParams();
    }

    if (query instanceof URLSearchParams) {
        return new URLSearchParams(query);
    }

    const params = new URLSearchParams();

    const fields = query.fields ?? query.select;
    if (fields && fields.length > 0) {
        params.set("fields", fields.join(","));
    }

    const search = query.search ?? query.s;
    if (search !== undefined) {
        params.set("s", JSON.stringify(search));
    }

    if (query.filters) {
        for (const filter of query.filters) {
            params.append("filter", serializeFilter(filter));
        }
    }

    if (query.or) {
        for (const condition of query.or) {
            params.append("or", serializeFilter(condition));
        }
    }

    if (query.joins) {
        for (const join of query.joins) {
            params.append("join", serializeJoin(join));
        }
    }

    if (query.sort) {
        for (const sort of query.sort) {
            params.append("sort", serializeSort(sort));
        }
    }

    if (query.limit !== undefined) {
        params.set("limit", String(query.limit));
    }

    if (query.offset !== undefined) {
        params.set("offset", String(query.offset));
    }

    if (query.page !== undefined) {
        params.set("page", String(query.page));
    }

    if (query.cache !== undefined) {
        params.set("cache", String(query.cache));
    }

    return params;
}
