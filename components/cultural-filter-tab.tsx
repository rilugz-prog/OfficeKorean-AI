"use client";

import * as React from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { CulturalFilterResponse } from "@/types";

export function CulturalFilterTab() {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CulturalFilterResponse | null>(
    null
  );

  async function onRefine() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/cultural-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Cultural filter failed");
      }
      const data: CulturalFilterResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Korean Cultural Filter
          </CardTitle>
          <CardDescription>
            Rewrite blunt messages to fit Korean workplace etiquette — less
            direct, hierarchy-aware, and professional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-input">Your message</Label>
            <Textarea
              id="filter-input"
              placeholder={'e.g. "This won\'t work."'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[220px]"
            />
          </div>
          <Button
            onClick={onRefine}
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Refining…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> Make it professional
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Professional version</CardTitle>
          <CardDescription>
            Polished for a Korean corporate context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!result && !error && (
            <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              The refined message will appear here.
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Original
                </p>
                <div className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {result.original}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Professional version
                </p>
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-base leading-relaxed whitespace-pre-wrap">
                  {result.professional}
                </div>
                <div className="mt-2">
                  <CopyButton value={result.professional} label="Copy" />
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why it changed
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.explanation}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
