// ---------------------------------------------------------------------------
// Server-side auth helpers. Used by Server Components and Route Handlers.
//
// Backed by Clerk: the session is resolved with `auth()` / `currentUser()` and
// mapped to the local `profiles` row (created lazily if the webhook hasn't run
// yet). Same exported surface as the previous Supabase implementation.
// ---------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isDbConfigured } from "@/lib/db";
import type { ProfileRow } from "@/lib/db/schema";
import {
  ensureProfile,
  getProfileByClerkId,
  type ClerkProfileInput,
} from "@/lib/user-sync";

export interface AuthUser {
  /** Internal profile id (profiles.id) — the owner id used for all queries. */
  id: string;
  clerkUserId: string;
  email: string | null;
}

/** Returns the current Clerk user id, or null. Never throws. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/** Returns the current Clerk user id, redirecting to /login if unauthenticated. */
export async function requireUserId(nextPath?: string): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${params}`);
  }
  return userId;
}

/** Build profile fields from the current Clerk user. */
async function clerkProfileInput(
  clerkUserId: string
): Promise<ClerkProfileInput> {
  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    null;
  const fullName =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") ||
    cu?.username ||
    null;
  return { clerkUserId, email, fullName, avatarUrl: cu?.imageUrl ?? null };
}

/** Returns the current user's profile, or null. */
export async function getProfile(): Promise<ProfileRow | null> {
  if (!isDbConfigured) return null;
  const userId = await getUserId();
  if (!userId) return null;
  return getProfileByClerkId(userId);
}

/** Returns the current user + profile, redirecting to /login if needed. */
export async function requireProfile(
  nextPath?: string
): Promise<{ user: AuthUser; profile: ProfileRow }> {
  const clerkUserId = await requireUserId(nextPath);

  let profile = await getProfileByClerkId(clerkUserId);
  if (!profile) {
    // Defensive: create a profile if the webhook hasn't synced yet.
    profile = await ensureProfile(await clerkProfileInput(clerkUserId));
  }

  return {
    user: { id: profile.id, clerkUserId, email: profile.email },
    profile,
  };
}
