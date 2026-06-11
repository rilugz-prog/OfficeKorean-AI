import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { saved_phrases } from "@/lib/db/schema";
import { checkPhraseLimit } from "@/lib/usage";

export const runtime = "nodejs";

// GET /api/phrases — list / search / filter the user's saved phrases.
// Query params: q, category, favorites=true, sort=newest|oldest|title
export async function GET(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const favorites = url.searchParams.get("favorites") === "true";
  const sort = url.searchParams.get("sort") ?? "newest";

  const conditions: SQL[] = [eq(saved_phrases.user_id, ctx.userId)];
  if (category && category !== "All") {
    conditions.push(eq(saved_phrases.category, category));
  }
  if (favorites) conditions.push(eq(saved_phrases.is_favorite, true));
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        ilike(saved_phrases.title, term),
        ilike(saved_phrases.phrase_content, term)
      ) as SQL
    );
  }

  const where = and(...conditions);
  const orderBy =
    sort === "title"
      ? asc(saved_phrases.title)
      : sort === "oldest"
        ? asc(saved_phrases.created_at)
        : desc(saved_phrases.created_at);

  try {
    const [items, totalRows] = await Promise.all([
      db.select().from(saved_phrases).where(where).orderBy(orderBy),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(saved_phrases)
        .where(where),
    ]);

    const limit = await checkPhraseLimit(ctx.userId, ctx.tier);

    return apiSuccess({
      items,
      total: Number(totalRows[0]?.total ?? 0),
      limit: { used: limit.used, max: limit.limit, remaining: limit.remaining },
    });
  } catch (dbError) {
    console.error("[/api/phrases GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load phrases.");
  }
}
