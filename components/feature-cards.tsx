"use client";

import { Languages, Sparkles, BookOpen, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WorkspaceTab } from "@/components/workspace";

const FEATURES: {
  tab: WorkspaceTab;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    tab: "translate",
    title: "Professional Translation",
    description:
      "Translate English ↔ Korean in the exact register for your coworker, manager, executive, email, or report.",
    icon: <Languages className="h-6 w-6" />,
  },
  {
    tab: "cultural-filter",
    title: "Korean Cultural Filter",
    description:
      "Rewrite blunt messages into polished, hierarchy-aware Korean that fits workplace etiquette.",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    tab: "explain-korean",
    title: "Explain Korean",
    description:
      "Decode a Korean message: real meaning, tone, hierarchy, urgency, hidden context, and ready replies.",
    icon: <BookOpen className="h-6 w-6" />,
  },
];

export function FeatureCards({
  onSelect,
}: {
  onSelect: (tab: WorkspaceTab) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <button
          key={f.tab}
          type="button"
          onClick={() => onSelect(f.tab)}
          className="group text-left focus:outline-none"
        >
          <Card
            className={cn(
              "h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
              "group-focus-visible:ring-2 group-focus-visible:ring-ring"
            )}
          >
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {f.icon}
              </div>
              <h3 className="mb-1.5 flex items-center gap-1 font-semibold">
                {f.title}
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
