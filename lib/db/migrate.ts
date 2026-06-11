// ---------------------------------------------------------------------------
// Apply generated Drizzle migrations to the Neon database.
//
//   npm run db:migrate
//
// Reads SQL from ./drizzle (produced by `npm run db:generate`) and runs any
// not-yet-applied migrations. Safe to re-run; already-applied migrations are
// skipped via Drizzle's __drizzle_migrations bookkeeping table.
// ---------------------------------------------------------------------------

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }

  const db = drizzle(neon(url));
  console.log("[migrate] applying migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] done.");
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
