/**
 * tRPC Client Utilities for React Client Components
 *
 * This module provides the TRPC provider and useTRPC hook for client-side
 * tRPC usage. Wrap your app in TRPCReactProvider and use useTRPC() in
 * client components.
 *
 * Usage:
 * 1. Wrap your app in TRPCReactProvider (usually in layout.tsx)
 * 2. Import { useTRPC } from "@/trpc/client" in client components
 * 3. Use trpc.<router>.<procedure>.queryOptions() with useQuery
 * 4. Use trpc.<router>.<procedure>.mutationOptions() with useMutation
 *
 * @example
 * ```tsx
 * // layout.tsx
 * import { TRPCReactProvider } from "@/trpc/client";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCReactProvider>{children}</TRPCReactProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // client-component.tsx
 * "use client";
 * import { useTRPC } from "@/trpc/client";
 * import { useQuery } from "@tanstack/react-query";
 *
 * export function MyComponent() {
 *   const trpc = useTRPC();
 *   const query = useQuery(
 *     trpc.cases.getCases.queryOptions({ limit: 50 })
 *   );
 *   if (query.isLoading) return <div>Loading...</div>;
 *   return <div>{query.data.length} cases</div>;
 * }
 * ```
 */
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@potuzhny-advokat/api";

import { env } from "@/env";
import { createQueryClient } from "./query-client";

/**
 * Singleton query client for browser usage.
 * Creates new client on server, reuses in browser.
 */
let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return createQueryClient();
    } else {
        // Browser: use singleton pattern to keep the same query client
        return (clientQueryClientSingleton ??= createQueryClient());
    }
};

/**
 * Hook and provider for client-side tRPC.
 *
 * - useTRPC(): Returns decorated router with queryOptions() and mutationOptions()
 * - TRPCProvider: Wraps app to provide tRPC context
 *
 * @example
 * const trpc = useTRPC();
 * const query = useQuery(trpc.cases.getCases.queryOptions({ limit: 50 }));
 * const mutation = useMutation(trpc.caseMetadata.updateCaseMetadata.mutationOptions());
 */
export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();

/**
 * Root provider for tRPC + React Query.
 * Wrap your app's root layout with this provider.
 *
 * @param children - App content
 * @example
 * <TRPCReactProvider>
 *   <YourApp />
 * </TRPCReactProvider>
 */
export function TRPCReactProvider(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                loggerLink({
                    enabled: (op) =>
                        env.NODE_ENV === "development" ||
                        (op.direction === "down" && op.result instanceof Error),
                }),
                httpBatchStreamLink({
                    transformer: SuperJSON,
                    url: getBaseUrl() + "/api/trpc",
                    headers() {
                        const headers = new Headers();
                        headers.set("x-trpc-source", "nextjs-react");
                        return headers;
                    },
                    // Ensure httpOnly auth cookie is sent with browser requests
                    fetch(input, init) {
                        return fetch(input, { ...init, credentials: "include" });
                    },
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}

/**
 * Gets the base URL for tRPC requests.
 * Handles browser, Vercel preview, and localhost.
 */
const getBaseUrl = () => {
    if (typeof window !== "undefined") return window.location.origin;
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
};
