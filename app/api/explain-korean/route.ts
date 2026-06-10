import { NextRequest, NextResponse } from "next/server";
import { runClaudeJSON } from "@/lib/anthropic";
import {
  EXPLAIN_KOREAN_SYSTEM,
  buildExplainKoreanPrompt,
} from "@/lib/prompts";
import { ExplainKoreanRequest, ExplainKoreanResponse } from "@/types";
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
    const body = (await req.json()) as Partial<ExplainKoreanRequest>;
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please paste a Korean message to explain." },
        { status: 400 }
      );
    }

    const ctx = await getOptionalAuthContext();
    if (ctx) {
      const check = await checkFeatureLimit(ctx.supabase, "explain_korean", ctx.tier);
      if (!check.allowed) {
        return NextResponse.json(
          {
            success: false,
            code: "LIMIT_REACHED",
            message: limitReachedMessage("explain_korean", check),
            feature: "explain_korean",
            used: check.used,
            limit: check.limit,
          },
          { status: 429 }
        );
      }
    }

    const result = await runClaudeJSON<ExplainKoreanResponse>({
      system: EXPLAIN_KOREAN_SYSTEM,
      user: buildExplainKoreanPrompt(text),
      maxTokens: 3072,
    });

    // Clamp urgency to the 1–10 scale defensively.
    if (typeof result.urgencyScore === "number") {
      result.urgencyScore = Math.max(1, Math.min(10, Math.round(result.urgencyScore)));
    }

    if (ctx) {
      await recordUsage(ctx.supabase, "explain_korean");
      await saveHistory(ctx.supabase, {
        userId: ctx.user.id,
        feature: "explain_korean",
        input: text,
        output: result.workplaceMeaning,
        metadata: {
          literalTranslation: result.literalTranslation,
          tone: result.tone,
          hierarchy: result.hierarchy,
          urgencyScore: result.urgencyScore,
          suggestedKoreanReply: result.suggestedKoreanReply,
          suggestedEnglishReply: result.suggestedEnglishReply,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/explain-korean]", err);
    const message =
      err instanceof Error ? err.message : "Explain Korean failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
