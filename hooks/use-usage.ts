"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { FeatureType, SubscriptionTier } from "@/lib/database.types";
import type { PlanDefinition } from "@/lib/plans";

export interface FeatureUsage {
  feature: FeatureType;
  used: number;
  limit: number | null;
  remaining: number | null;
  period: "day" | "month" | "total";
}

export interface UsageData {
  tier: SubscriptionTier;
  plan: PlanDefinition;
  features: FeatureUsage[];
  phrases: { used: number; limit: number | null; remaining: number | null };
  counts: { history: number; favorites: number };
  trend: { feature_type: FeatureType; usage_count: number; usage_date: string }[];
}

export function useUsage() {
  const [data, setData] = React.useState<UsageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<UsageData>("/api/usage");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
