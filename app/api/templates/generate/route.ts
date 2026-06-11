import { eq } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { templates as templatesTable } from "@/lib/db/schema";
import { parseBody, generateTemplateSchema } from "@/lib/validation";
import { checkFeatureLimit, recordUsage, saveHistory } from "@/lib/usage";
import { runClaudeJSON } from "@/lib/anthropic";
import { TEMPLATE_SYSTEM, buildTemplatePrompt } from "@/lib/prompts";
import type { TemplateGenerateResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/templates/generate — generate Korean + English + cultural notes.
// Counts against the user's "translation" allowance.
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, generateTemplateSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  // Resolve the template title/category (look up by id if provided).
  let templateTitle = parsed.data.template_title ?? "Workplace Message";
  let category = parsed.data.category ?? "Custom";
  if (parsed.data.template_id) {
    const [tpl] = await db
      .select({
        title: templatesTable.title,
        category: templatesTable.category,
      })
      .from(templatesTable)
      .where(eq(templatesTable.id, parsed.data.template_id))
      .limit(1);
    if (tpl) {
      templateTitle = tpl.title;
      category = tpl.category;
    }
  }

  // Enforce the translation limit.
  const check = await checkFeatureLimit(ctx.userId, "translation", ctx.tier);
  if (!check.allowed) {
    return apiError(
      "LIMIT_REACHED",
      `Daily translation limit reached (${check.limit}). Upgrade for unlimited template generation.`,
      { feature: "translation", used: check.used, limit: check.limit }
    );
  }

  let result: TemplateGenerateResponse;
  try {
    result = await runClaudeJSON<TemplateGenerateResponse>({
      system: TEMPLATE_SYSTEM,
      user: buildTemplatePrompt({
        templateTitle,
        category,
        name: parsed.data.name,
        department: parsed.data.department,
        project: parsed.data.project,
        situation: parsed.data.situation,
      }),
    });
  } catch (err) {
    console.error("[/api/templates/generate]", err);
    return apiError("SERVER_ERROR", "Template generation failed. Please try again.");
  }

  await recordUsage(ctx.userId, "translation");
  await saveHistory({
    userId: ctx.userId,
    feature: "translation",
    input: parsed.data.situation,
    output: `${result.korean}\n\n${result.english}`,
    metadata: {
      source: "template",
      template: templateTitle,
      category,
      explanation: result.explanation,
    },
  });

  return apiSuccess({ result });
}
