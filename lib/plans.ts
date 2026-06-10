// ---------------------------------------------------------------------------
// Plan definitions & limits. Single source of truth for entitlements, used by
// both the usage-enforcement engine (server) and the pricing/upgrade UI.
//
// A limit of `null` means unlimited. `period` controls how usage is counted.
// ---------------------------------------------------------------------------

import type { FeatureType, SubscriptionTier } from "@/lib/database.types";

export type LimitPeriod = "day" | "month" | "total";

export interface PlanFeatureLimit {
  limit: number | null; // null = unlimited
  period: LimitPeriod;
}

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number; // USD; 0 = free
  tagline: string;
  highlights: string[];
  limits: {
    translation: PlanFeatureLimit;
    cultural_filter: PlanFeatureLimit;
    explain_korean: PlanFeatureLimit;
    saved_phrases: PlanFeatureLimit;
  };
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "Get started with the essentials.",
    highlights: [
      "20 translations / day",
      "10 cultural filters / day",
      "10 Explain Korean analyses / month",
      "Save up to 5 phrases",
      "All workplace templates",
    ],
    limits: {
      translation: { limit: 20, period: "day" },
      cultural_filter: { limit: 10, period: "day" },
      explain_korean: { limit: 10, period: "month" },
      saved_phrases: { limit: 5, period: "total" },
    },
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceMonthly: 12,
    tagline: "For professionals using Korean every day.",
    highlights: [
      "Unlimited translations",
      "Unlimited cultural filters",
      "Unlimited Explain Korean",
      "Save up to 20 phrases",
      "Priority model access",
    ],
    limits: {
      translation: { limit: null, period: "day" },
      cultural_filter: { limit: null, period: "day" },
      explain_korean: { limit: null, period: "month" },
      saved_phrases: { limit: 20, period: "total" },
    },
  },
  premium: {
    tier: "premium",
    name: "Premium",
    priceMonthly: 29,
    tagline: "Everything, unlimited, for power users & teams.",
    highlights: [
      "Unlimited everything",
      "Unlimited saved phrases",
      "Custom templates",
      "Early access to new features",
    ],
    limits: {
      translation: { limit: null, period: "day" },
      cultural_filter: { limit: null, period: "day" },
      explain_korean: { limit: null, period: "month" },
      saved_phrases: { limit: null, period: "total" },
    },
  },
};

export const PLAN_ORDER: SubscriptionTier[] = ["free", "pro", "premium"];

export function getPlan(tier: SubscriptionTier): PlanDefinition {
  return PLANS[tier] ?? PLANS.free;
}

export function featureLimit(
  tier: SubscriptionTier,
  feature: FeatureType
): PlanFeatureLimit {
  return getPlan(tier).limits[feature];
}

export function phraseLimit(tier: SubscriptionTier): PlanFeatureLimit {
  return getPlan(tier).limits.saved_phrases;
}

export const FEATURE_LABELS: Record<FeatureType, string> = {
  translation: "Translation",
  cultural_filter: "Cultural Filter",
  explain_korean: "Explain Korean",
};
