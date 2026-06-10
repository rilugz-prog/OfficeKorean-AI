import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
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

  let query = ctx.supabase
    .from("saved_phrases")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.user.id);

  if (category && category !== "All") query = query.eq("category", category);
  if (favorites) query = query.eq("is_favorite", true);
  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`title.ilike.%${safe}%,phrase_content.ilike.%${safe}%`);
  }

  if (sort === "title") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: sort === "oldest" });

  const { data, error: dbError, count } = await query;
  if (dbError) {
    console.error("[/api/phrases GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load phrases.");
  }

  const limit = await checkPhraseLimit(ctx.supabase, ctx.user.id, ctx.tier);

  return apiSuccess({
    items: data ?? [],
    total: count ?? 0,
    limit: { used: limit.used, max: limit.limit, remaining: limit.remaining },
  });
}
