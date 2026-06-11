import { and, eq } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { saved_phrases } from "@/lib/db/schema";
import { parseBody, updatePhraseSchema } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/phrases/update — update an owned phrase.
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, updatePhraseSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const { id, ...updates } = parsed.data;
  if (Object.keys(updates).length === 0) {
    return apiError("VALIDATION_ERROR", "No fields to update.");
  }

  const [phrase] = await db
    .update(saved_phrases)
    .set({ ...updates, updated_at: new Date() })
    .where(and(eq(saved_phrases.id, id), eq(saved_phrases.user_id, ctx.userId)))
    .returning();

  if (!phrase) return apiError("NOT_FOUND", "Phrase not found.");
  return apiSuccess({ phrase });
}
