import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgres://trusanity_admin:trusanity_password@localhost:5432/trusanity_db",
    },
});
