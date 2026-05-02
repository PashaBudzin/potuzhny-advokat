import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { validatePass } from "@potuzhny-advokat/auth-crypto";
import { env } from "./env";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const passwordHash = opts.headers.get("Authorization");

    if (!passwordHash) return {};

    passwordHash.split("Bearer ");

    if (!passwordHash[0]) return {};

    return {
        passwordHash,
    };
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!env.PASSWORD_HASH) return next({});

    if (!ctx.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED" });

    if (validatePass(env.PASSWORD_HASH, ctx.passwordHash)) return next({});
    else throw new TRPCError({ code: "UNAUTHORIZED" });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
