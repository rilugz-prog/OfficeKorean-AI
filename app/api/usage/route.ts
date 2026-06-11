import { and, asc, eq, gte, sql } from "drizzle-orm";
import { getAuthContext, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { favorites, translation_history, usage_tracking } from "@/lib/db/schema";
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
      const used = await getFeatureUsage(ctx.userId, feature, ctx.tier);
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

  const phrase = await checkPhraseLimit(ctx.userId, ctx.tier);

  // Aggregate counts for dashboard cards.
  const [historyCountRows, favCountRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(translation_history)
      .where(eq(translation_history.user_id, ctx.userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(favorites)
      .where(eq(favorites.user_id, ctx.userId)),
  ]);

  // 7-day usage trend for charts.
  const since = new Date();
  since.setDate(since.getDate() - 6);
  const sinceDate = since.toISOString().slice(0, 10);
  const trendRows = await db
    .select({
      feature_type: usage_tracking.feature_type,
      usage_count: usage_tracking.usage_count,
      usage_date: usage_tracking.usage_date,
    })
    .from(usage_tracking)
    .where(
      and(
        eq(usage_tracking.user_id, ctx.userId),
        gte(usage_tracking.usage_date, sinceDate)
      )
    )
    .orderBy(asc(usage_tracking.usage_date));

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
      history: Number(historyCountRows[0]?.count ?? 0),
      favorites: Number(favCountRows[0]?.count ?? 0),
    },
    trend: trendRows,
  });
}
