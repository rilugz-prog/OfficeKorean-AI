import { Languages, Sparkles, BookOpen, type LucideIcon } from "lucide-react";
import type { FeatureType } from "@/lib/database.types";

export const FEATURE_META: Record<
  FeatureType,
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  translation: {
    label: "Translation",
    icon: Languages,
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  cultural_filter: {
    label: "Cultural Filter",
    icon: Sparkles,
    badgeClass:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  explain_korean: {
    label: "Explain Korean",
    icon: BookOpen,
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};
