import { createTRPCRouter } from "./trpc";
import casesRouter from "./routers/cases";
import caseMetadataRouter from "./routers/case-metadata";

export const appRouter = createTRPCRouter({
    cases: casesRouter,
    caseMetadata: caseMetadataRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
