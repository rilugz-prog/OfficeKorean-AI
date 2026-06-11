// ---------------------------------------------------------------------------
// Shared Route Handler helpers: structured JSON responses + auth context.
//
// Auth is backed by Clerk; ownership is enforced in application code via
// `ctx.userId` (the internal profiles.id). The structured error envelope is
// unchanged from the Supabase implementation.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isDbConfigured } from "@/lib/db";
import type { ProfileRow } from "@/lib/db/schema";
import { ensureProfile, getProfileByClerkId } from "@/lib/user-sync";
import type { SubscriptionTier } from "@/lib/database.types";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "NOT_CONFIGURED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "LIMIT_REACHED"
  | "PHRASE_LIMIT_REACHED"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  NOT_CONFIGURED: 503,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  LIMIT_REACHED: 429,
  PHRASE_LIMIT_REACHED: 403,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export function apiError(
  code: ApiErrorCode,
  message: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, code, message, ...extra },
    { status: STATUS_BY_CODE[code] }
  );
}

export function apiSuccess<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json({ success: true, ...data });
}

export interface AuthContext {
  /** Internal owner id (profiles.id) — scope every query by this. */
  userId: string;
  /** External Clerk identity. */
  clerkUserId: string;
  profile: ProfileRow;
  tier: SubscriptionTier;
}

/** Resolve (or lazily create) the profile for the signed-in Clerk user. */
async function resolveProfile(clerkUserId: string): Promise<ProfileRow | null> {
  const existing = await getProfileByClerkId(clerkUserId);
  if (existing) return existing;

  // Webhook hasn't synced yet — create defensively from the Clerk user.
  const cu = await currentUser();
  return ensureProfile({
    clerkUserId,
    email:
      cu?.primaryEmailAddress?.emailAddress ??
      cu?.emailAddresses?.[0]?.emailAddress ??
      null,
    fullName:
      [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") ||
      cu?.username ||
      null,
    avatarUrl: cu?.imageUrl ?? null,
  });
}

/**
 * Resolve the authenticated context for a Route Handler. Returns either a
 * ready-to-return error response or the live context.
 */
export async function getAuthContext(): Promise<
  { error: NextResponse; ctx?: never } | { ctx: AuthContext; error?: never }
> {
  if (!isDbConfigured) {
    return {
      error: apiError(
        "NOT_CONFIGURED",
        "Accounts are not enabled on this deployment."
      ),
    };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { error: apiError("UNAUTHENTICATED", "Please sign in to continue.") };
  }

  const profile = await resolveProfile(clerkUserId);
  if (!profile) {
    return { error: apiError("SERVER_ERROR", "Could not load your profile.") };
  }

  return {
    ctx: {
      userId: profile.id,
      clerkUserId,
      profile,
      tier: profile.subscription_tier,
    },
  };
}

/**
 * Soft variant: returns the auth context if the user is signed in, otherwise
 * null. Used by the core AI features, which still work anonymously when no one
 * is logged in (or the database/Clerk are not configured).
 */
export async function getOptionalAuthContext(): Promise<AuthContext | null> {
  if (!isDbConfigured) return null;
  const { userId } = await auth();
  if (!userId) return null;
  const result = await getAuthContext();
  return result.ctx ?? null;
}
