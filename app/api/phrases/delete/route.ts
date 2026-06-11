import { and, eq } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { saved_phrases } from "@/lib/db/schema";
import { parseBody, idSchema } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/phrases/delete — delete an owned phrase.
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, idSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  try {
    const deleted = await db
      .delete(saved_phrases)
      .where(
        and(
          eq(saved_phrases.id, parsed.data.id),
          eq(saved_phrases.user_id, ctx.userId)
        )
      )
      .returning({ id: saved_phrases.id });

    if (deleted.length === 0) return apiError("NOT_FOUND", "Phrase not found.");
    return apiSuccess({ deleted: deleted.length });
  } catch (dbError) {
    console.error("[/api/phrases/delete]", dbError);
    return apiError("SERVER_ERROR", "Could not delete the phrase.");
  }
}
