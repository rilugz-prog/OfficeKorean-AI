"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { SavedPhrase } from "@/lib/database.types";
import type { CreatePhraseInput, UpdatePhraseInput } from "@/lib/validation";

export interface PhraseFilters {
  q?: string;
  category?: string;
  favorites?: boolean;
  sort?: "newest" | "oldest" | "title";
}

interface PhraseLimit {
  used: number;
  max: number | null;
  remaining: number | null;
}

export function useSavedPhrases(initial: PhraseFilters = {}) {
  const [items, setItems] = React.useState<SavedPhrase[]>([]);
  const [limit, setLimit] = React.useState<PhraseLimit | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<PhraseFilters>(initial);

  const fetchItems = React.useCallback(async (f: PhraseFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set("q", f.q);
      if (f.category && f.category !== "All") params.set("category", f.category);
      if (f.favorites) params.set("favorites", "true");
      if (f.sort) params.set("sort", f.sort);

      const data = await apiFetch<{ items: SavedPhrase[]; limit: PhraseLimit }>(
        `/api/phrases?${params.toString()}`
      );
      setItems(data.items);
      setLimit(data.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load phrases.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItems(filters);
  }, [filters, fetchItems]);

  const updateFilters = React.useCallback((next: Partial<PhraseFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const refresh = React.useCallback(() => fetchItems(filters), [fetchItems, filters]);

  const create = React.useCallback(
    async (input: CreatePhraseInput) => {
      const data = await apiFetch<{ phrase: SavedPhrase }>("/api/phrases/create", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await refresh();
      return data.phrase;
    },
    [refresh]
  );

  const update = React.useCallback(
    async (input: UpdatePhraseInput) => {
      const data = await apiFetch<{ phrase: SavedPhrase }>("/api/phrases/update", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setItems((prev) => prev.map((p) => (p.id === data.phrase.id ? data.phrase : p)));
      return data.phrase;
    },
    []
  );

  const toggleFavorite = React.useCallback(
    async (id: string, isFavorite: boolean) => {
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: isFavorite } : p))
      );
      try {
        await apiFetch("/api/phrases/update", {
          method: "POST",
          body: JSON.stringify({ id, is_favorite: isFavorite }),
        });
      } catch {
        setItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_favorite: !isFavorite } : p))
        );
      }
    },
    []
  );

  const remove = React.useCallback(async (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    await apiFetch("/api/phrases/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    setLimit((l) => (l ? { ...l, used: Math.max(0, l.used - 1) } : l));
  }, []);

  return {
    items,
    limit,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    create,
    update,
    toggleFavorite,
    remove,
  };
}
