import { and, asc, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { translation_history } from "@/lib/db/schema";
import { parseBody, historyFavoriteSchema } from "@/lib/validation";
import type { FeatureType } from "@/lib/database.types";

export const runtime = "nodejs";

const VALID_FEATURES: FeatureType[] = [
  "translation",
  "cultural_filter",
  "explain_korean",
];

// GET /api/history — search / filter / sort the user's history.
// Query params: q, feature, favorites=true, from, to, sort=newest|oldest, limit, offset
export async function GET(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const feature = url.searchParams.get("feature") as FeatureType | null;
  const favorites = url.searchParams.get("favorites") === "true";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const sort = url.searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
  const offset = Number(url.searchParams.get("offset")) || 0;

  const conditions: SQL[] = [eq(translation_history.user_id, ctx.userId)];
  if (feature && VALID_FEATURES.includes(feature)) {
    conditions.push(eq(translation_history.feature_type, feature));
  }
  if (favorites) conditions.push(eq(translation_history.is_favorite, true));
  if (from) conditions.push(gte(translation_history.created_at, new Date(from)));
  if (to) {
    conditions.push(
      lte(translation_history.created_at, new Date(`${to}T23:59:59.999Z`))
    );
  }
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(
        ilike(translation_history.input_text, term),
        ilike(translation_history.output_text, term)
      ) as SQL
    );
  }

  const where = and(...conditions);
  const orderBy =
    sort === "oldest"
      ? asc(translation_history.created_at)
      : desc(translation_history.created_at);

  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(translation_history)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(translation_history)
        .where(where),
    ]);
    return apiSuccess({
      items,
      total: Number(totalRows[0]?.total ?? 0),
      limit,
      offset,
    });
  } catch (dbError) {
    console.error("[/api/history GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load history.");
  }
}

// PATCH /api/history — toggle the favorite flag on an entry.
export async function PATCH(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, historyFavoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const [item] = await db
    .update(translation_history)
    .set({ is_favorite: parsed.data.is_favorite })
    .where(
      and(
        eq(translation_history.id, parsed.data.id),
        eq(translation_history.user_id, ctx.userId)
      )
    )
    .returning();

  if (!item) return apiError("NOT_FOUND", "History entry not found.");
  return apiSuccess({ item });
}
