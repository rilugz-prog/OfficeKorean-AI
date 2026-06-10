import { runClaudeJSON } from "./lib/anthropic.ts";
import {
  CULTURAL_FILTER_SYSTEM,
  buildCulturalFilterPrompt,
} from "./lib/prompts.ts";

interface CulturalFilterRequest {
  text: string;
}

interface CulturalFilterResponse {
  original: string;
  professional: string;
  explanation: string;
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
    const body = (await req.json()) as Partial<CulturalFilterRequest>;
    const { text } = body;

    // Validate input
    if (!text || !text.toString().trim()) {
      return new Response(
        JSON.stringify({
          error: "Please provide a message to refine.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Claude
    const result = await runClaudeJSON<CulturalFilterResponse>({
      system: CULTURAL_FILTER_SYSTEM,
      user: buildCulturalFilterPrompt(text as string),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[cultural-filter]", err);
    const message =
      err instanceof Error ? err.message : "Cultural filter failed.";
    return new Response(
      JSON.stringify({ error: message } as ErrorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
