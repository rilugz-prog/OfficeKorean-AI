import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { parseBody, historyDeleteSchema } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/history/delete — delete one or many history entries (owner-scoped).
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, historyDeleteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const ids = parsed.data.ids ?? (parsed.data.id ? [parsed.data.id] : []);

  const { error: dbError, count } = await ctx.supabase
    .from("translation_history")
    .delete({ count: "exact" })
    .eq("user_id", ctx.user.id)
    .in("id", ids);

  if (dbError) {
    console.error("[/api/history/delete]", dbError);
    return apiError("SERVER_ERROR", "Could not delete history.");
  }

  return apiSuccess({ deleted: count ?? 0 });
}
