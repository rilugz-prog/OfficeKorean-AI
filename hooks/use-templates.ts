"use client";

import * as React from "react";
import { apiFetch } from "@/lib/client-api";
import type { Template } from "@/lib/database.types";
import type { TemplateGenerateResponse } from "@/types";
import type { GenerateTemplateInput } from "@/lib/validation";

export interface TemplateGroup {
  category: string;
  templates: Template[];
}

export function useTemplates() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [grouped, setGrouped] = React.useState<TemplateGroup[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{
        templates: Template[];
        grouped: TemplateGroup[];
        categories: string[];
      }>("/api/templates");
      setTemplates(data.templates);
      setGrouped(data.grouped);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const generate = React.useCallback(
    async (input: GenerateTemplateInput): Promise<TemplateGenerateResponse> => {
      const data = await apiFetch<{ result: TemplateGenerateResponse }>(
        "/api/templates/generate",
        { method: "POST", body: JSON.stringify(input) }
      );
      return data.result;
    },
    []
  );

  return { templates, grouped, categories, loading, error, refresh, generate };
}
