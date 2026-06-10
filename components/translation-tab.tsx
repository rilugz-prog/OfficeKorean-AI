"use client";

import * as React from "react";
import { Loader2, Languages, ArrowLeftRight } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";
import {
  CommunicationMode,
  DIRECTION_OPTIONS,
  MODE_OPTIONS,
  TranslateResponse,
  TranslationDirection,
} from "@/types";

export function TranslationTab() {
  const [text, setText] = React.useState("");
  const [direction, setDirection] =
    React.useState<TranslationDirection>("en-to-ko");
  const [mode, setMode] = React.useState<CommunicationMode>("team-member");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TranslateResponse | null>(null);

  async function onTranslate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction, mode }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Translation failed");
      }
      const data: TranslateResponse = await res.json();
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
            <Languages className="h-5 w-5 text-primary" /> Professional Translation
          </CardTitle>
          <CardDescription>
            Translate between English and Korean in the right workplace register.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as TranslationDirection)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Communication mode</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as CommunicationMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="translate-input">
              {direction === "en-to-ko" ? "English text" : "Korean text"}
            </Label>
            <Textarea
              id="translate-input"
              placeholder={
                direction === "en-to-ko"
                  ? "Type the English message you want to send…"
                  : "번역할 한국어 메시지를 입력하세요…"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px]"
            />
          </div>

          <Button
            onClick={onTranslate}
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Translating…
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4" /> Translate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Translation</CardTitle>
          <CardDescription>
            {MODE_OPTIONS.find((m) => m.value === mode)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!result && !error && (
            <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Your translation will appear here.
            </div>
          )}

          {result && (
            <>
              <div className="rounded-md border bg-muted/40 p-4 text-base leading-relaxed whitespace-pre-wrap">
                {result.translation}
              </div>
              {result.notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note: </span>
                  {result.notes}
                </p>
              )}
              <CopyButton value={result.translation} label="Copy translation" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
