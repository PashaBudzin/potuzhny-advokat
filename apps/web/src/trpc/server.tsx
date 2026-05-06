/**
 * tRPC Server Utilities for React Server Components (RSC)
 *
 * This module provides utilities for prefetching data on the server and hydrating
 * it to the client. Used in Next.js App Router pages that need SSR data.
 *
 * Usage:
 * - Import { trpc, prefetch, HydrateClient } from "@/trpc/server"
 * - Use prefetch() to prepare data server-side
 * - Wrap client component in <HydrateClient> to transfer dehydrated state
 *
 * @example
 * ```tsx
 * // page.tsx (Server Component)
 * import { trpc, prefetch, HydrateClient } from "@/trpc/server";
 * import ClientComponent from "./client-component";
 *
 * export default async function Page() {
 *   void prefetch(trpc.cases.getCases.queryOptions({ limit: 50 }));
 *   return (
 *     <HydrateClient>
 *       <ClientComponent />
 *     </HydrateClient>
 *   );
 * }
 * ```
 */
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@potuzhny-advokat/api";
import { appRouter, createTRPCContext } from "@potuzhny-advokat/api";

import { createQueryClient } from "./query-client";

/**
 * Creates a tRPC context for server-side requests.
 * Extracts headers (including auth cookie) and sets the tRPC source to "rsc".
 *
 * @returns Promise<{ passwordHash: string | undefined }>
 */
const createContext = cache(async () => {
    const heads = new Headers(await headers());
    heads.set("x-trpc-source", "rsc");

    return createTRPCContext({
        headers: heads,
    });
});

/**
 * Cached query client singleton for server-side prefetching.
 */
const getQueryClient = cache(createQueryClient);

/**
 * tRPC proxy for server-side usage.
 * Provides typed access to all router procedures via queryOptions() and mutationOptions().
 *
 * @example
 * // Prefetch data
 * trpc.cases.getCases.queryOptions({ limit: 50 })
 *
 * // Call directly (rarely needed in RSC)
 * trpc.cases.getCases.query({ limit: 50 })
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
    router: appRouter,
    ctx: createContext,
    queryClient: getQueryClient,
});

/**
 * Hydrates dehydrated tRPC state to the client.
 * Use this to wrap client components that receive prefetched data.
 *
 * @param children - Client component that uses tRPC data
 * @example
 * <HydrateClient>
 *   <DashboardClient initialCases={initialCases} />
 * </HydrateClient>
 */
export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}

/**
 * Prefetches query data on the server.
 * Call this in RSC pages to prepare data before rendering.
 *
 * @param queryOptions - tRPC query options from trpc.<router>.<procedure>.queryOptions()
 * @example
 * void prefetch(trpc.cases.getCases.queryOptions({ limit: 50 }));
 */
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === "infinite") {
        void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
        void queryClient.prefetchQuery(queryOptions);
    }
}
