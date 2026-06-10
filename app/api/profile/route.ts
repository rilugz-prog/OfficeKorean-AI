import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { parseBody, updateProfileSchema } from "@/lib/validation";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

// GET /api/profile — current user's profile + plan.
export async function GET() {
  const { ctx, error } = await getAuthContext();
  if (error) return error;
  return apiSuccess({ profile: ctx.profile, plan: getPlan(ctx.tier) });
}

// PATCH /api/profile — update editable profile fields.
export async function PATCH(req: Request) {
  const { ctx, error } = await getAuthContext();
  if (error) return error;

  const parsed = await parseBody(req, updateProfileSchema);
  if (!parsed.ok) return apiError("VALIDATION_ERROR", parsed.error);

  const updates = { ...parsed.data };
  // Merge notification preferences instead of replacing wholesale.
  if (updates.notification_preferences) {
    updates.notification_preferences = {
      ...ctx.profile.notification_preferences,
      ...updates.notification_preferences,
    };
  }
  if (updates.avatar_url === "") updates.avatar_url = undefined;

  const { data, error: dbError } = await ctx.supabase
    .from("profiles")
    .update(updates)
    .eq("id", ctx.user.id)
    .select("*")
    .single();

  if (dbError) {
    console.error("[/api/profile PATCH]", dbError);
    return apiError("SERVER_ERROR", "Could not update your profile.");
  }

  return apiSuccess({ profile: data });
}
