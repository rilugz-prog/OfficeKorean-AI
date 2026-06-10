"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { FeatureType, TranslationHistory } from "@/lib/database.types";

export interface HistoryFilters {
  q?: string;
  feature?: FeatureType | "all";
  favorites?: boolean;
  from?: string;
  to?: string;
  sort?: "newest" | "oldest";
}

export function useHistory(initial: HistoryFilters = {}) {
  const [items, setItems] = React.useState<TranslationHistory[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<HistoryFilters>(initial);

  const fetchItems = React.useCallback(async (f: HistoryFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set("q", f.q);
      if (f.feature && f.feature !== "all") params.set("feature", f.feature);
      if (f.favorites) params.set("favorites", "true");
      if (f.from) params.set("from", f.from);
      if (f.to) params.set("to", f.to);
      if (f.sort) params.set("sort", f.sort);

      const data = await apiFetch<{ items: TranslationHistory[]; total: number }>(
        `/api/history?${params.toString()}`
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItems(filters);
  }, [filters, fetchItems]);

  const updateFilters = React.useCallback((next: Partial<HistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const toggleFavorite = React.useCallback(
    async (id: string, isFavorite: boolean) => {
      // Optimistic update.
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_favorite: isFavorite } : it))
      );
      try {
        await apiFetch("/api/history", {
          method: "PATCH",
          body: JSON.stringify({ id, is_favorite: isFavorite }),
        });
      } catch {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, is_favorite: !isFavorite } : it
          )
        );
      }
    },
    []
  );

  const remove = React.useCallback(async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    await apiFetch("/api/history/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }, []);

  const refresh = React.useCallback(() => fetchItems(filters), [fetchItems, filters]);

  return {
    items,
    total,
    loading,
    error,
    filters,
    updateFilters,
    toggleFavorite,
    remove,
    refresh,
  };
}
