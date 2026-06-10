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
// All checks are owner-scoped through RLS + auth.uid().
// ---------------------------------------------------------------------------

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeatureType, SubscriptionTier } from "@/lib/database.types";
import { featureLimit, phraseLimit, FEATURE_LABELS } from "@/lib/plans";

type DB = SupabaseClient;

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
  supabase: DB,
  feature: FeatureType,
  tier: SubscriptionTier
): Promise<number> {
  const { period } = featureLimit(tier, feature);
  const rpc = period === "month" ? "usage_this_month" : "usage_today";
  const { data, error } = await supabase.rpc(rpc, { p_feature: feature });
  if (error) {
    console.error("[usage] getFeatureUsage", error);
    return 0;
  }
  return (data as number) ?? 0;
}

/** Check whether the user may use a feature right now. */
export async function checkFeatureLimit(
  supabase: DB,
  feature: FeatureType,
  tier: SubscriptionTier
): Promise<LimitCheck> {
  const { limit, period } = featureLimit(tier, feature);
  if (limit === null) {
    return { allowed: true, used: 0, limit: null, remaining: null, period };
  }
  const used = await getFeatureUsage(supabase, feature, tier);
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
  supabase: DB,
  feature: FeatureType
): Promise<number> {
  const { data, error } = await supabase.rpc("increment_usage", {
    p_feature: feature,
  });
  if (error) {
    console.error("[usage] recordUsage", error);
    return 0;
  }
  return (data as number) ?? 0;
}

/** Persist a history entry. Best-effort: failures are logged, not thrown. */
export async function saveHistory(
  supabase: DB,
  params: {
    userId: string;
    feature: FeatureType;
    input: string;
    output: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("translation_history")
    .insert({
      user_id: params.userId,
      feature_type: params.feature,
      input_text: params.input,
      output_text: params.output,
      metadata: params.metadata ?? {},
    })
    .select("id")
    .single();
  if (error) {
    console.error("[usage] saveHistory", error);
    return null;
  }
  return data?.id ?? null;
}

/** Check whether the user may save another phrase. */
export async function checkPhraseLimit(
  supabase: DB,
  userId: string,
  tier: SubscriptionTier
): Promise<LimitCheck> {
  const { limit } = phraseLimit(tier);
  if (limit === null) {
    return { allowed: true, used: 0, limit: null, remaining: null, period: "total" };
  }
  const { count } = await supabase
    .from("saved_phrases")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  const used = count ?? 0;
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
