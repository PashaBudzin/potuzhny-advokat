/**
 * Query Client Configuration for tRPC + TanStack Query
 *
 * Configures the React Query client with:
 * - SuperJSON for data serialization (handles dates, etc.)
 * - Default stale time to avoid immediate refetching
 * - Proper dehydration/hydration for SSR
 *
 * This is used by both server (prefetch) and client providers.
 */
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import SuperJSON from "superjson";

/**
 * Creates a configured QueryClient for tRPC.
 * Used by both server-side prefetching and client-side provider.
 *
 * @returns QueryClient with SuperJSON serialization and default options
 */
export const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 30 * 1000,
            },
            dehydrate: {
                serializeData: SuperJSON.serialize,
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query) || query.state.status === "pending",
                shouldRedactErrors: () => {
                    // We should not catch Next.js server errors
                    // as that's how Next.js detects dynamic pages
                    // so we cannot redact them.
                    // Next.js also automatically redacts errors for us
                    // with better digests.
                    return false;
                },
            },
            hydrate: {
                deserializeData: SuperJSON.deserialize,
            },
        },
    });
