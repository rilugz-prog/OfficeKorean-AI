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
import { getOptionalAuthContext } from "@/lib/api";
import {
  checkFeatureLimit,
  recordUsage,
  saveHistory,
  limitReachedMessage,
} from "@/lib/usage";

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

    // Enforce per-plan limits for signed-in users (anonymous use is unmetered).
    const ctx = await getOptionalAuthContext();
    if (ctx) {
      const check = await checkFeatureLimit(ctx.supabase, "translation", ctx.tier);
      if (!check.allowed) {
        return NextResponse.json(
          {
            success: false,
            code: "LIMIT_REACHED",
            message: limitReachedMessage("translation", check),
            feature: "translation",
            used: check.used,
            limit: check.limit,
          },
          { status: 429 }
        );
      }
    }

    const result = await runClaudeJSON<TranslateResponse>({
      system: TRANSLATION_SYSTEM,
      user: buildTranslationPrompt(text, direction, mode),
    });

    if (ctx) {
      await recordUsage(ctx.supabase, "translation");
      await saveHistory(ctx.supabase, {
        userId: ctx.user.id,
        feature: "translation",
        input: text,
        output: result.translation,
        metadata: { direction, mode, notes: result.notes },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/translate]", err);
    const message =
      err instanceof Error ? err.message : "Translation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
