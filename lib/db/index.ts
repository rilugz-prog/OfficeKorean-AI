// ---------------------------------------------------------------------------
// Drizzle ORM client backed by Neon's serverless HTTP driver.
//
// This is the single `db` instance used by every server-side query (Route
// Handlers, Server Components, the usage engine). It is import-safe even when
// DATABASE_URL is unset — `isDbConfigured` lets callers degrade gracefully so
// the anonymous MVP still builds and runs without a database.
// ---------------------------------------------------------------------------

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

export const isDbConfigured = Boolean(DATABASE_URL);

// Use a harmless placeholder when unconfigured so importing this module never
// throws at build time; any actual query will fail loudly at runtime instead.
const sql = neon(DATABASE_URL || "postgresql://user:pass@localhost/db");

export const db = drizzle(sql, { schema });

export { schema };
export type DB = typeof db;
