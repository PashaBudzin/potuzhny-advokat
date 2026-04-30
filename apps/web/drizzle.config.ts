import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/accounting/db/schema.ts",
    out: "./src/lib/accounting/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
