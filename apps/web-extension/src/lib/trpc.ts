import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@potuzhny-advokat/api";
import superjson from "superjson";

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: "http://localhost:3000/api/trpc", transformer: superjson })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
    ctx: { passwordHash: "TODO! ADD password hash" },
});
