import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@potuzhny-advokat/api";
import superjson from "superjson";
import browser from "webextension-polyfill";

export const queryClient = new QueryClient();

export async function getTRPCHeaders(): Promise<Record<string, string>> {
    const result = await browser.storage.local.get("passwordHash");
    return {
        Authentification: result.passwordHash ?? "",
    };
}

let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>> | null = null;

export function getTRPCClient() {
    if (!trpcClient) {
        trpcClient = createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: "http://localhost:3000/api/trpc",
                    transformer: superjson,
                    async headers() {
                        return await getTRPCHeaders();
                    },
                }),
            ],
        });
    }
    return trpcClient;
}

export const trpc = createTRPCOptionsProxy<AppRouter>({
    get client() {
        return getTRPCClient();
    },
    queryClient,
});
