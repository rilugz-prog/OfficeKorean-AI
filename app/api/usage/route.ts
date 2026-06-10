import { getAuthContext, apiSuccess } from "@/lib/api";
import { getPlan } from "@/lib/plans";
import { getFeatureUsage, checkPhraseLimit } from "@/lib/usage";
import type { FeatureType } from "@/lib/database.types";

export const runtime = "nodejs";

const FEATURES: FeatureType[] = ["translation", "cultural_filter", "explain_korean"];

// GET /api/usage — usage vs. limits across all features + counts for dashboard.
export async function GET() {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const plan = getPlan(ctx.tier);

  const features = await Promise.all(
    FEATURES.map(async (feature) => {
      const used = await getFeatureUsage(ctx.supabase, feature, ctx.tier);
      const { limit, period } = plan.limits[feature];
      return {
        feature,
        used,
        limit,
        period,
        remaining: limit === null ? null : Math.max(0, limit - used),
      };
    })
  );

  const phrase = await checkPhraseLimit(ctx.supabase, ctx.user.id, ctx.tier);

  // Aggregate counts for dashboard cards.
  const [historyCount, favCount] = await Promise.all([
    ctx.supabase
      .from("translation_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.user.id),
    ctx.supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.user.id),
  ]);

  // 7-day usage trend for charts.
  const since = new Date();
  since.setDate(since.getDate() - 6);
  const { data: trendRows } = await ctx.supabase
    .from("usage_tracking")
    .select("feature_type, usage_count, usage_date")
    .eq("user_id", ctx.user.id)
    .gte("usage_date", since.toISOString().slice(0, 10))
    .order("usage_date", { ascending: true });

  return apiSuccess({
    tier: ctx.tier,
    plan,
    features,
    phrases: {
      used: phrase.used,
      limit: phrase.limit,
      remaining: phrase.remaining,
    },
    counts: {
      history: historyCount.count ?? 0,
      favorites: favCount.count ?? 0,
    },
    trend: trendRows ?? [],
  });
}
