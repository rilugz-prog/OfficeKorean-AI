// ---------------------------------------------------------------------------
// User synchronization service.
//
// Maps Clerk users to local `profiles` rows. Used by:
//   - the Clerk webhook (lib → app/api/webhooks/clerk) as the primary sync,
//   - the server auth helpers (lib/auth, lib/api) as a defensive lazy create.
//
// `profiles.id` is the internal owner id that every other table FKs to;
// `profiles.clerk_user_id` is the external identity from Clerk.
// ---------------------------------------------------------------------------

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, type ProfileRow } from "@/lib/db/schema";

export interface ClerkProfileInput {
  clerkUserId: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}

/** Look up a profile by its Clerk user id. */
export async function getProfileByClerkId(
  clerkUserId: string
): Promise<ProfileRow | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerk_user_id, clerkUserId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Ensure a profile exists for a Clerk user, creating it if missing. Concurrent
 * callers are safe via the unique constraint on clerk_user_id.
 */
export async function ensureProfile(
  input: ClerkProfileInput
): Promise<ProfileRow> {
  await db
    .insert(profiles)
    .values({
      clerk_user_id: input.clerkUserId,
      email: input.email ?? null,
      full_name: input.fullName ?? null,
      avatar_url: input.avatarUrl ?? null,
    })
    .onConflictDoNothing({ target: profiles.clerk_user_id });

  const row = await getProfileByClerkId(input.clerkUserId);
  if (!row) throw new Error("Failed to create profile.");
  return row;
}

/**
 * Upsert a profile from a Clerk webhook event (user.created / user.updated).
 * Updates identity fields but never touches subscription_tier or preferences.
 */
export async function upsertProfileFromClerk(
  input: ClerkProfileInput
): Promise<void> {
  await db
    .insert(profiles)
    .values({
      clerk_user_id: input.clerkUserId,
      email: input.email ?? null,
      full_name: input.fullName ?? null,
      avatar_url: input.avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: profiles.clerk_user_id,
      set: {
        email: input.email ?? null,
        full_name: input.fullName ?? null,
        avatar_url: input.avatarUrl ?? null,
        updated_at: new Date(),
      },
    });
}

/** Delete a profile (and all owned rows via ON DELETE CASCADE). */
export async function deleteProfileByClerkId(
  clerkUserId: string
): Promise<void> {
  await db.delete(profiles).where(eq(profiles.clerk_user_id, clerkUserId));
}
