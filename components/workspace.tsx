"use client";

import { Languages, Sparkles, BookOpen } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranslationTab } from "@/components/translation-tab";
import { CulturalFilterTab } from "@/components/cultural-filter-tab";
import { ExplainKoreanTab } from "@/components/explain-korean-tab";

export type WorkspaceTab = "translate" | "cultural-filter" | "explain-korean";

export function Workspace({
  value,
  onValueChange,
}: {
  value: WorkspaceTab;
  onValueChange: (tab: WorkspaceTab) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as WorkspaceTab)}
      className="w-full"
    >
      <div className="flex justify-center">
        <TabsList className="h-auto flex-wrap justify-center gap-1">
          <TabsTrigger value="translate" className="gap-1.5">
            <Languages className="h-4 w-4" /> Translation
          </TabsTrigger>
          <TabsTrigger value="cultural-filter" className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Cultural Filter
          </TabsTrigger>
          <TabsTrigger value="explain-korean" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Explain Korean
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="translate">
        <TranslationTab />
      </TabsContent>
      <TabsContent value="cultural-filter">
        <CulturalFilterTab />
      </TabsContent>
      <TabsContent value="explain-korean">
        <ExplainKoreanTab />
      </TabsContent>
    </Tabs>
  );
}
