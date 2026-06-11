// ---------------------------------------------------------------------------
// Raw Neon SQL client.
//
// A thin tagged-template SQL client over the same Neon serverless driver that
// powers Drizzle in lib/db/index.ts. Use this for one-off scripts (migrations,
// seeding) and ad-hoc queries where the ORM is unnecessary. App code should
// prefer the typed `db` export from "@/lib/db".
// ---------------------------------------------------------------------------

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!DATABASE_URL && process.env.NODE_ENV !== "production") {
  // Scripts (migrate/seed) need a real URL; surface the problem early.
  console.warn("[neon] DATABASE_URL is not set.");
}

export const sql = neon(
  DATABASE_URL || "postgresql://user:pass@localhost/db"
);
