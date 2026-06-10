// Shared Anthropic utilities for Base44 backend functions
// This runs on Deno in the Base44 backend

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "claude-opus-4-8";

interface MessageCreateParams {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface TextBlock {
  type: "text";
  text: string;
}

interface MessageResponse {
  content: TextBlock[];
}

/**
 * Call the Anthropic Claude API via REST (compatible with Deno)
 */
async function callClaude(params: MessageCreateParams): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to Base44 secrets via: npx base44 secrets set ANTHROPIC_API_KEY=sk-ant-..."
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as MessageResponse;
  return data.content
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Run Claude and return raw text response
 */
export async function runClaude({
  system,
  user,
  maxTokens = 2048,
}: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  return callClaude({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
}

/**
 * Run Claude and parse response as JSON
 */
export async function runClaudeJSON<T>({
  system,
  user,
  maxTokens = 2048,
}: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const raw = await runClaude({ system, user, maxTokens });
  return parseJSON<T>(raw);
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Fall back to extracting the first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice) as T;
    }
    throw new Error("Claude returned a response that could not be parsed as JSON.");
  }
}
