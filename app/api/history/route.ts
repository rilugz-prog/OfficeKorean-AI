import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
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

  let query = ctx.supabase
    .from("translation_history")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.user.id);

  if (feature && VALID_FEATURES.includes(feature)) {
    query = query.eq("feature_type", feature);
  }
  if (favorites) query = query.eq("is_favorite", true);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (q) {
    // Search both input and output text.
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`input_text.ilike.%${safe}%,output_text.ilike.%${safe}%`);
  }

  query = query
    .order("created_at", { ascending: sort === "oldest" })
    .range(offset, offset + limit - 1);

  const { data, error: dbError, count } = await query;
  if (dbError) {
    console.error("[/api/history GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load history.");
  }

  return apiSuccess({ items: data ?? [], total: count ?? 0, limit, offset });
}

// PATCH /api/history — toggle the favorite flag on an entry.
export async function PATCH(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, historyFavoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const { data, error: dbError } = await ctx.supabase
    .from("translation_history")
    .update({ is_favorite: parsed.data.is_favorite })
    .eq("id", parsed.data.id)
    .eq("user_id", ctx.user.id)
    .select("*")
    .single();

  if (dbError || !data) {
    return apiError("NOT_FOUND", "History entry not found.");
  }
  return apiSuccess({ item: data });
}
