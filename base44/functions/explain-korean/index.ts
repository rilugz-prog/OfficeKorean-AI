import { runClaudeJSON } from "./lib/anthropic.ts";
import {
  EXPLAIN_KOREAN_SYSTEM,
  buildExplainKoreanPrompt,
} from "./lib/prompts.ts";

interface ExplainKoreanRequest {
  text: string;
}

interface ExplainKoreanResponse {
  literalTranslation: string;
  workplaceMeaning: string;
  tone: string[];
  hierarchy: string;
  urgencyScore: number;
  culturalContext: string;
  suggestedKoreanReply: string;
  suggestedEnglishReply: string;
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
    const body = (await req.json()) as Partial<ExplainKoreanRequest>;
    const { text } = body;

    // Validate input
    if (!text || !text.toString().trim()) {
      return new Response(
        JSON.stringify({
          error: "Please paste a Korean message to explain.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Claude (with higher max tokens for detailed analysis)
    const result = await runClaudeJSON<ExplainKoreanResponse>({
      system: EXPLAIN_KOREAN_SYSTEM,
      user: buildExplainKoreanPrompt(text as string),
      maxTokens: 3072,
    });

    // Clamp urgency to the 1–10 scale defensively
    if (typeof result.urgencyScore === "number") {
      result.urgencyScore = Math.max(
        1,
        Math.min(10, Math.round(result.urgencyScore))
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[explain-korean]", err);
    const message =
      err instanceof Error ? err.message : "Explain Korean failed.";
    return new Response(
      JSON.stringify({ error: message } as ErrorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
