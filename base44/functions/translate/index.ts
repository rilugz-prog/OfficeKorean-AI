import { runClaudeJSON } from "./lib/anthropic.ts";
import {
  TRANSLATION_SYSTEM,
  buildTranslationPrompt,
  type CommunicationMode,
  type TranslationDirection,
} from "./lib/prompts.ts";

const DIRECTION_OPTIONS: Array<{ value: TranslationDirection }> = [
  { value: "en-to-ko" },
  { value: "ko-to-en" },
];

const MODE_OPTIONS: Array<{ value: CommunicationMode }> = [
  { value: "casual-coworker" },
  { value: "team-member" },
  { value: "manager" },
  { value: "executive" },
  { value: "email" },
  { value: "meeting" },
  { value: "report" },
];

interface TranslateRequest {
  text: string;
  direction: TranslationDirection;
  mode: CommunicationMode;
}

interface TranslateResponse {
  translation: string;
  notes: string;
}

interface ErrorResponse {
  error: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Only handle POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" } as ErrorResponse),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = (await req.json()) as Partial<TranslateRequest>;
    const { text, direction, mode } = body;

    // Validate input
    if (!text || !text.toString().trim()) {
      return new Response(
        JSON.stringify({
          error: "Please provide text to translate.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (
      !direction ||
      !DIRECTION_OPTIONS.some((d) => d.value === direction)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid translation direction.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!mode || !MODE_OPTIONS.some((m) => m.value === mode)) {
      return new Response(
        JSON.stringify({
          error: "Invalid communication mode.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Claude
    const result = await runClaudeJSON<TranslateResponse>({
      system: TRANSLATION_SYSTEM,
      user: buildTranslationPrompt(text as string, direction, mode),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[translate]", err);
    const message =
      err instanceof Error ? err.message : "Translation failed.";
    return new Response(
      JSON.stringify({ error: message } as ErrorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
