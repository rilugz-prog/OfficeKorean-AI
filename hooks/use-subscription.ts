"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { Profile, SubscriptionTier } from "@/lib/database.types";
import { getPlan, PLAN_ORDER, type PlanDefinition } from "@/lib/plans";

export function useSubscription() {
  const [tier, setTier] = React.useState<SubscriptionTier>("free");
  const [plan, setPlan] = React.useState<PlanDefinition>(getPlan("free"));
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ profile: Profile; plan: PlanDefinition }>(
        "/api/profile"
      );
      setTier(data.profile.subscription_tier);
      setPlan(data.plan);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const tierIndex = PLAN_ORDER.indexOf(tier);

  return {
    tier,
    plan,
    loading,
    refresh,
    isFree: tier === "free",
    isPro: tier === "pro",
    isPremium: tier === "premium",
    canUpgrade: tierIndex < PLAN_ORDER.length - 1,
  };
}
