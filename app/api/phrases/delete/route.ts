import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { parseBody, idSchema } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/phrases/delete — delete an owned phrase.
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, idSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const { error: dbError, count } = await ctx.supabase
    .from("saved_phrases")
    .delete({ count: "exact" })
    .eq("id", parsed.data.id)
    .eq("user_id", ctx.user.id);

  if (dbError) {
    console.error("[/api/phrases/delete]", dbError);
    return apiError("SERVER_ERROR", "Could not delete the phrase.");
  }
  if (!count) return apiError("NOT_FOUND", "Phrase not found.");

  return apiSuccess({ deleted: count });
}
