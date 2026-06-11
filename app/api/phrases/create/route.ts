import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { saved_phrases } from "@/lib/db/schema";
import { parseBody, createPhraseSchema } from "@/lib/validation";
import { checkPhraseLimit } from "@/lib/usage";
import { phraseLimit } from "@/lib/plans";

export const runtime = "nodejs";

// POST /api/phrases/create — enforces the per-plan saved-phrase cap.
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, createPhraseSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const check = await checkPhraseLimit(ctx.userId, ctx.tier);
  if (!check.allowed) {
    return apiError(
      "PHRASE_LIMIT_REACHED",
      `You've reached your saved-phrase limit (${check.limit}). Upgrade to save more.`,
      { used: check.used, limit: check.limit }
    );
  }

  try {
    const [phrase] = await db
      .insert(saved_phrases)
      .values({
        user_id: ctx.userId,
        title: parsed.data.title,
        category: parsed.data.category,
        phrase_content: parsed.data.phrase_content,
        language: parsed.data.language,
        is_favorite: parsed.data.is_favorite ?? false,
      })
      .returning();

    const remaining =
      phraseLimit(ctx.tier).limit === null
        ? null
        : Math.max(0, (check.limit ?? 0) - check.used - 1);

    return apiSuccess({ phrase, remaining });
  } catch (dbError) {
    console.error("[/api/phrases/create]", dbError);
    return apiError("SERVER_ERROR", "Could not save the phrase.");
  }
}
