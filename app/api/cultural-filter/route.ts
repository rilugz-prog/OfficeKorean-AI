import { NextRequest, NextResponse } from "next/server";
import { runClaudeJSON } from "@/lib/anthropic";
import {
  CULTURAL_FILTER_SYSTEM,
  buildCulturalFilterPrompt,
} from "@/lib/prompts";
import { CulturalFilterRequest, CulturalFilterResponse } from "@/types";
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
    const body = (await req.json()) as Partial<CulturalFilterRequest>;
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide a message to refine." },
        { status: 400 }
      );
    }

    const ctx = await getOptionalAuthContext();
    if (ctx) {
      const check = await checkFeatureLimit(ctx.userId, "cultural_filter", ctx.tier);
      if (!check.allowed) {
        return NextResponse.json(
          {
            success: false,
            code: "LIMIT_REACHED",
            message: limitReachedMessage("cultural_filter", check),
            feature: "cultural_filter",
            used: check.used,
            limit: check.limit,
          },
          { status: 429 }
        );
      }
    }

    const result = await runClaudeJSON<CulturalFilterResponse>({
      system: CULTURAL_FILTER_SYSTEM,
      user: buildCulturalFilterPrompt(text),
    });

    if (ctx) {
      await recordUsage(ctx.userId, "cultural_filter");
      await saveHistory({
        userId: ctx.userId,
        feature: "cultural_filter",
        input: text,
        output: result.professional,
        metadata: { explanation: result.explanation },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/cultural-filter]", err);
    const message =
      err instanceof Error ? err.message : "Cultural filter failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
