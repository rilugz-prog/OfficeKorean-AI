import { NextRequest, NextResponse } from "next/server";
import { runClaudeJSON } from "@/lib/anthropic";
import {
  CULTURAL_FILTER_SYSTEM,
  buildCulturalFilterPrompt,
} from "@/lib/prompts";
import { CulturalFilterRequest, CulturalFilterResponse } from "@/types";

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

    const result = await runClaudeJSON<CulturalFilterResponse>({
      system: CULTURAL_FILTER_SYSTEM,
      user: buildCulturalFilterPrompt(text),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/cultural-filter]", err);
    const message =
      err instanceof Error ? err.message : "Cultural filter failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
