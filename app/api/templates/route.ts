import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import type { Template } from "@/lib/database.types";

export const runtime = "nodejs";

// GET /api/templates — system templates + the user's custom templates,
// grouped by category for the Template Center.
export async function GET() {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const { data, error: dbError } = await ctx.supabase
    .from("templates")
    .select("*")
    .or(`is_system.eq.true,user_id.eq.${ctx.user.id}`)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (dbError) {
    console.error("[/api/templates GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load templates.");
  }

  const templates = (data ?? []) as Template[];
  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const grouped = categories.map((category) => ({
    category,
    templates: templates.filter((t) => t.category === category),
  }));

  return apiSuccess({ templates, grouped, categories });
}
