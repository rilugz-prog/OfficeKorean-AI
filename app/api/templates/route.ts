import { asc, eq, or } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { templates as templatesTable } from "@/lib/db/schema";
import type { Template } from "@/lib/database.types";

export const runtime = "nodejs";

// GET /api/templates — system templates + the user's custom templates,
// grouped by category for the Template Center.
export async function GET() {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  let data;
  try {
    data = await db
      .select()
      .from(templatesTable)
      .where(
        or(
          eq(templatesTable.is_system, true),
          eq(templatesTable.user_id, ctx.userId)
        )
      )
      .orderBy(asc(templatesTable.category), asc(templatesTable.sort_order));
  } catch (dbError) {
    console.error("[/api/templates GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load templates.");
  }

  const templates = data as unknown as Template[];
  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const grouped = categories.map((category) => ({
    category,
    templates: templates.filter((t) => t.category === category),
  }));

  return apiSuccess({ templates, grouped, categories });
}
