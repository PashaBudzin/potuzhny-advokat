import { defineConfig } from "drizzle-kit";
import { dbEnv } from "./src/env.ts";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: dbEnv().DB_URL,
    },
});
