"use client";

import * as React from "react";
import {
  Loader2,
  BookOpen,
  Search,
  Gauge,
  Users,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { ExplainKoreanResponse } from "@/types";

function UrgencyMeter({ score }: { score: number }) {
  const pct = (Math.max(1, Math.min(10, score)) / 10) * 100;
  const color =
    score >= 8
      ? "bg-red-500"
      : score >= 5
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <Gauge className="h-4 w-4" /> Urgency
        </span>
        <span className="font-semibold">{score}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function ExplainKoreanTab() {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ExplainKoreanResponse | null>(
    null
  );

  async function onExplain() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/explain-korean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Explain Korean failed.");
      setResult(data as ExplainKoreanResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input */}
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Explain Korean
          </CardTitle>
          <CardDescription>
            Paste a Korean workplace message to decode its real meaning, tone,
            hierarchy, and hidden expectations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="explain-input">Korean message</Label>
            <Textarea
              id="explain-input"
              placeholder="받은 한국어 메시지를 붙여넣으세요…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[220px]"
            />
          </div>
          <Button
            onClick={onExplain}
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Explain message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>What the message really means.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!result && !error && (
            <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              The breakdown will appear here.
            </div>
          )}

          {result && (
            <>
              <Section title="Literal translation">
                <p className="whitespace-pre-wrap">{result.literalTranslation}</p>
              </Section>

              <Section title="Workplace meaning">
                <p className="whitespace-pre-wrap">{result.workplaceMeaning}</p>
              </Section>

              <Section title="Tone">
                <div className="flex flex-wrap gap-1.5">
                  {result.tone?.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Section>

              <Section title="Hierarchy" icon={<Users className="h-3.5 w-3.5" />}>
                <Badge variant="outline">{result.hierarchy}</Badge>
              </Section>

              <UrgencyMeter score={result.urgencyScore} />

              <Section title="Cultural context">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {result.culturalContext}
                </p>
              </Section>

              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <Section
                  title="Suggested Korean reply"
                  icon={<MessageSquare className="h-3.5 w-3.5" />}
                >
                  <div className="rounded-md border bg-background p-3 whitespace-pre-wrap">
                    {result.suggestedKoreanReply}
                  </div>
                  <div className="mt-2">
                    <CopyButton
                      value={result.suggestedKoreanReply}
                      label="Copy Korean reply"
                    />
                  </div>
                </Section>

                <Section title="Suggested English reply">
                  <div className="rounded-md border bg-background p-3 whitespace-pre-wrap">
                    {result.suggestedEnglishReply}
                  </div>
                  <div className="mt-2">
                    <CopyButton
                      value={result.suggestedEnglishReply}
                      label="Copy English reply"
                    />
                  </div>
                </Section>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
