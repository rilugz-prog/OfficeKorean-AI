import { eq } from "drizzle-orm";
import { getAuthContext, apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
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

  const input = parsed.data;
  const updates: Record<string, unknown> = {};

  if (input.full_name !== undefined) updates.full_name = input.full_name;
  if (input.preferred_language !== undefined)
    updates.preferred_language = input.preferred_language;
  if (input.default_translation_mode !== undefined)
    updates.default_translation_mode = input.default_translation_mode;
  if (input.theme !== undefined) updates.theme = input.theme;
  // Empty string clears the avatar.
  if (input.avatar_url !== undefined)
    updates.avatar_url = input.avatar_url === "" ? null : input.avatar_url;
  // Merge notification preferences instead of replacing wholesale.
  if (input.notification_preferences) {
    updates.notification_preferences = {
      ...ctx.profile.notification_preferences,
      ...input.notification_preferences,
    };
  }

  if (Object.keys(updates).length === 0) {
    return apiSuccess({ profile: ctx.profile });
  }
  updates.updated_at = new Date();

  try {
    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, ctx.userId))
      .returning();
    return apiSuccess({ profile: updated });
  } catch (dbError) {
    console.error("[/api/profile PATCH]", dbError);
    return apiError("SERVER_ERROR", "Could not update your profile.");
  }
}
