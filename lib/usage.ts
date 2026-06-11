// ---------------------------------------------------------------------------
// Usage-limit engine (server only).
//
// Responsibilities:
//   1. Read a feature's current usage for the authenticated user.
//   2. Compare against the user's plan limit.
//   3. Atomically increment usage after a successful API call.
//   4. Persist translation/analysis history.
//   5. Enforce the saved-phrase cap.
//
// All checks are owner-scoped by `userId` (profiles.id) in application code.
// ---------------------------------------------------------------------------

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { saved_phrases, translation_history, usage_tracking } from "@/lib/db/schema";
import type { FeatureType, SubscriptionTier } from "@/lib/database.types";
import { featureLimit, phraseLimit, FEATURE_LABELS } from "@/lib/plans";

export interface LimitCheck {
  allowed: boolean;
  /** Current usage in the relevant period. */
  used: number;
  /** Plan limit (null = unlimited). */
  limit: number | null;
  /** Remaining calls (null = unlimited). */
  remaining: number | null;
  period: "day" | "month" | "total";
}

const FRIENDLY_PERIOD: Record<LimitCheck["period"], string> = {
  day: "Daily",
  month: "Monthly",
  total: "",
};

/** Read current usage for a feature in its limit period. */
export async function getFeatureUsage(
  userId: string,
  feature: FeatureType,
  tier: SubscriptionTier
): Promise<number> {
  const { period } = featureLimit(tier, feature);
  try {
    if (period === "month") {
      const rows = await db
        .select({
          total: sql<number>`coalesce(sum(${usage_tracking.usage_count}), 0)::int`,
        })
        .from(usage_tracking)
        .where(
          and(
            eq(usage_tracking.user_id, userId),
            eq(usage_tracking.feature_type, feature),
            gte(
              usage_tracking.usage_date,
              sql`date_trunc('month', current_date)::date`
            )
          )
        );
      return Number(rows[0]?.total ?? 0);
    }

    const rows = await db
      .select({ usage_count: usage_tracking.usage_count })
      .from(usage_tracking)
      .where(
        and(
          eq(usage_tracking.user_id, userId),
          eq(usage_tracking.feature_type, feature),
          eq(usage_tracking.usage_date, sql`current_date`)
        )
      )
      .limit(1);
    return rows[0]?.usage_count ?? 0;
  } catch (err) {
    console.error("[usage] getFeatureUsage", err);
    return 0;
  }
}

/** Check whether the user may use a feature right now. */
export async function checkFeatureLimit(
  userId: string,
  feature: FeatureType,
  tier: SubscriptionTier
): Promise<LimitCheck> {
  const { limit, period } = featureLimit(tier, feature);
  if (limit === null) {
    return { allowed: true, used: 0, limit: null, remaining: null, period };
  }
  const used = await getFeatureUsage(userId, feature, tier);
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    period,
  };
}

/** Atomically record one use of a feature; returns the new count. */
export async function recordUsage(
  userId: string,
  feature: FeatureType
): Promise<number> {
  try {
    const rows = await db
      .insert(usage_tracking)
      .values({ user_id: userId, feature_type: feature, usage_count: 1 })
      .onConflictDoUpdate({
        target: [
          usage_tracking.user_id,
          usage_tracking.feature_type,
          usage_tracking.usage_date,
        ],
        set: { usage_count: sql`${usage_tracking.usage_count} + 1` },
      })
      .returning({ usage_count: usage_tracking.usage_count });
    return rows[0]?.usage_count ?? 0;
  } catch (err) {
    console.error("[usage] recordUsage", err);
    return 0;
  }
}

/** Persist a history entry. Best-effort: failures are logged, not thrown. */
export async function saveHistory(params: {
  userId: string;
  feature: FeatureType;
  input: string;
  output: string;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  try {
    const rows = await db
      .insert(translation_history)
      .values({
        user_id: params.userId,
        feature_type: params.feature,
        input_text: params.input,
        output_text: params.output,
        metadata: params.metadata ?? {},
      })
      .returning({ id: translation_history.id });
    return rows[0]?.id ?? null;
  } catch (err) {
    console.error("[usage] saveHistory", err);
    return null;
  }
}

/** Check whether the user may save another phrase. */
export async function checkPhraseLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<LimitCheck> {
  const { limit } = phraseLimit(tier);
  if (limit === null) {
    return {
      allowed: true,
      used: 0,
      limit: null,
      remaining: null,
      period: "total",
    };
  }
  let used = 0;
  try {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(saved_phrases)
      .where(eq(saved_phrases.user_id, userId));
    used = Number(rows[0]?.count ?? 0);
  } catch (err) {
    console.error("[usage] checkPhraseLimit", err);
  }
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    period: "total",
  };
}

/** Build the user-facing message for a reached feature limit. */
export function limitReachedMessage(
  feature: FeatureType,
  check: LimitCheck
): string {
  const label = FEATURE_LABELS[feature];
  const periodWord = FRIENDLY_PERIOD[check.period];
  const prefix = periodWord ? `${periodWord} ` : "";
  return `${prefix}${label.toLowerCase()} limit reached (${check.limit}). Upgrade for more.`;
}
