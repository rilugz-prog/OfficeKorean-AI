import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
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

  const { data, error: dbError } = await ctx.supabase
    .from("saved_phrases")
    .update(updates)
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .select("*")
    .single();

  if (dbError || !data) {
    return apiError("NOT_FOUND", "Phrase not found.");
  }
  return apiSuccess({ phrase: data });
}
