"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { SortField, SortOrder, CaseState } from "@/lib/actions/cases";
import { AddCaseForm } from "./add-case-form";
import { CaseFilters } from "./case-filters";
import { CaseTableWithPagination } from "./case-table";

export default function DashboardClient() {
    const trpc = useTRPC();

    const [offset, setOffset] = useState(0);
    const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
        field: "lastUpdated",
        order: "desc",
    });
    const [state, setState] = useState<CaseState | "">("");
    const [search, setSearch] = useState("");
    const limit = 50;

    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const casesQuery = useQuery(
        trpc.cases.getCases.queryOptions({
            offset: offset,
            limit: limit,
            sortField: sort.field,
            sortOrder: sort.order,
            state: state || null,
            search: search || null,
        }),
    );

    const countQuery = useQuery(
        trpc.cases.getCasesCount.queryOptions({
            state: state || null,
            search: search || null,
        }),
    );

    const cases = casesQuery.data ?? [];
    const filteredCount = countQuery.data ?? 0;
    const isLoading = casesQuery.isLoading;

    const handleSort = (field: SortField) => {
        const newOrder = sort.field === field && sort.order === "desc" ? "asc" : "desc";
        setSort({ field, order: newOrder });
        setOffset(0);
    };

    const handleStateChange = (newState: CaseState | "") => {
        setState(newState);
        setOffset(0);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setOffset(0);
    };

    const loadMore = () => {
        setOffset((prev) => prev + limit);
    };

    const toggleRow = (caseNumber: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(caseNumber)) {
                newSet.delete(caseNumber);
            } else {
                newSet.add(caseNumber);
            }
            return newSet;
        });
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="mb-6 text-2xl font-bold font-heading">Список клієнтів</h1>
            <AddCaseForm />
            <CaseFilters
                state={state}
                onStateChange={handleStateChange}
                sort={sort}
                onSort={handleSort}
                search={search}
                onSearch={handleSearch}
                filteredCount={filteredCount}
            />
            {isLoading ? (
                <p className="py-8 text-center text-muted-foreground">Завантаження...</p>
            ) : casesQuery.isError ? (
                <p className="py-8 text-center text-muted-foreground">
                    Помилка: {casesQuery.error.message}
                </p>
            ) : (
                <CaseTableWithPagination
                    cases={cases}
                    expandedRows={expandedRows}
                    onToggleRow={toggleRow}
                    onLoadMore={loadMore}
                    pending={casesQuery.isFetching}
                    hasMore={cases.length < filteredCount}
                />
            )}
        </div>
    );
}
