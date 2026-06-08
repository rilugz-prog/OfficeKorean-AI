import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Reusable Anthropic (Claude) client
// ---------------------------------------------------------------------------

let client: Anthropic | null = null;

/**
 * Lazily instantiate a single shared Anthropic client.
 * Throws a clear error if the API key is missing so the route can return 500
 * with a helpful message instead of a cryptic SDK error.
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment (.env.local locally, or Vercel project settings)."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** Default model — Claude Opus 4.8. Override with the ANTHROPIC_MODEL env var. */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

interface RunClaudeOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Run a single-turn Claude completion and return the raw text response.
 */
export async function runClaude({
  system,
  user,
  maxTokens = 2048,
  temperature,
}: RunClaudeOptions): Promise<string> {
  const anthropic = getAnthropicClient();

  const createParams: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  };

  if (temperature !== undefined) {
    createParams.temperature = temperature;
  }

  const message = await anthropic.messages.create(
    createParams as Parameters<typeof anthropic.messages.create>[0]
  );

  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Run Claude and parse the response as JSON. Tolerates models that wrap JSON in
 * markdown code fences or add surrounding prose by extracting the outermost
 * JSON object.
 */
export async function runClaudeJSON<T>(
  options: RunClaudeOptions
): Promise<T> {
  const raw = await runClaude(options);
  return parseJSON<T>(raw);
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present.
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Fall back to extracting the first {...} block.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice) as T;
    }
    throw new Error("Claude returned a response that could not be parsed as JSON.");
  }
}
