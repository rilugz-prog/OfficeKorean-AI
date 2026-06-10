"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { Profile } from "@/lib/database.types";
import type { PlanDefinition } from "@/lib/plans";
import type { UpdateProfileInput } from "@/lib/validation";

export function useProfile() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [plan, setPlan] = React.useState<PlanDefinition | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ profile: Profile; plan: PlanDefinition }>(
        "/api/profile"
      );
      setProfile(data.profile);
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const update = React.useCallback(async (updates: UpdateProfileInput) => {
    const data = await apiFetch<{ profile: Profile }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setProfile(data.profile);
    return data.profile;
  }, []);

  return { profile, plan, loading, error, refresh, update };
}
