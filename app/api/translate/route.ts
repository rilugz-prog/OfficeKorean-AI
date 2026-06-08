import { NextRequest, NextResponse } from "next/server";
import { runClaudeJSON } from "@/lib/anthropic";
import {
  TRANSLATION_SYSTEM,
  buildTranslationPrompt,
} from "@/lib/prompts";
import {
  TranslateRequest,
  TranslateResponse,
  DIRECTION_OPTIONS,
  MODE_OPTIONS,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TranslateRequest>;
    const { text, direction, mode } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide text to translate." },
        { status: 400 }
      );
    }
    if (!direction || !DIRECTION_OPTIONS.some((d) => d.value === direction)) {
      return NextResponse.json(
        { error: "Invalid translation direction." },
        { status: 400 }
      );
    }
    if (!mode || !MODE_OPTIONS.some((m) => m.value === mode)) {
      return NextResponse.json(
        { error: "Invalid communication mode." },
        { status: 400 }
      );
    }

    const result = await runClaudeJSON<TranslateResponse>({
      system: TRANSLATION_SYSTEM,
      user: buildTranslationPrompt(text, direction, mode),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/translate]", err);
    const message =
      err instanceof Error ? err.message : "Translation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
