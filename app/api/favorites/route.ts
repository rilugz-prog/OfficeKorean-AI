import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { parseBody, favoriteSchema } from "@/lib/validation";

export const runtime = "nodejs";

// GET /api/favorites — list the user's favorites (optionally by resource_type).
export async function GET(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const type = new URL(req.url).searchParams.get("resource_type");
  let query = ctx.supabase
    .from("favorites")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });
  if (type) query = query.eq("resource_type", type);

  const { data, error: dbError } = await query;
  if (dbError) {
    console.error("[/api/favorites GET]", dbError);
    return apiError("SERVER_ERROR", "Could not load favorites.");
  }
  return apiSuccess({ items: data ?? [] });
}

// POST /api/favorites — add a favorite (idempotent via unique constraint).
export async function POST(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, favoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const { data, error: dbError } = await ctx.supabase
    .from("favorites")
    .upsert(
      {
        user_id: ctx.user.id,
        resource_type: parsed.data.resource_type,
        resource_id: parsed.data.resource_id,
      },
      { onConflict: "user_id,resource_type,resource_id" }
    )
    .select("*")
    .single();

  if (dbError) {
    console.error("[/api/favorites POST]", dbError);
    return apiError("SERVER_ERROR", "Could not add favorite.");
  }
  return apiSuccess({ favorite: data });
}

// DELETE /api/favorites — remove a favorite.
export async function DELETE(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, favoriteSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const { error: dbError, count } = await ctx.supabase
    .from("favorites")
    .delete({ count: "exact" })
    .eq("user_id", ctx.user.id)
    .eq("resource_type", parsed.data.resource_type)
    .eq("resource_id", parsed.data.resource_id);

  if (dbError) {
    console.error("[/api/favorites DELETE]", dbError);
    return apiError("SERVER_ERROR", "Could not remove favorite.");
  }
  return apiSuccess({ deleted: count ?? 0 });
}
