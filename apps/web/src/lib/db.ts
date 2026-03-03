import { createDbConnection } from "@netra/db";

// Use NEXT_PUBLIC_DATABASE_URL or DATABASE_URL
const dbUrl = process.env.DATABASE_URL || "postgres://netra:netra_secret@localhost:5433/netra_db";

export const db = createDbConnection(dbUrl);
