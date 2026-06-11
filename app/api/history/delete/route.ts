import { and, eq, inArray } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { translation_history } from "@/lib/db/schema";
import { parseBody, historyDeleteSchema } from "@/lib/validation";

export const runtime = "nodejs";

// POST /api/history/delete — delete one or many history entries (owner-scoped).
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, historyDeleteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const ids = parsed.data.ids ?? (parsed.data.id ? [parsed.data.id] : []);
  if (ids.length === 0) return apiSuccess({ deleted: 0 });

  try {
    const deleted = await db
      .delete(translation_history)
      .where(
        and(
          eq(translation_history.user_id, ctx.userId),
          inArray(translation_history.id, ids)
        )
      )
      .returning({ id: translation_history.id });
    return apiSuccess({ deleted: deleted.length });
  } catch (dbError) {
    console.error("[/api/history/delete]", dbError);
    return apiError("SERVER_ERROR", "Could not delete history.");
  }
}
