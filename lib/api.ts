// ---------------------------------------------------------------------------
// Shared Route Handler helpers: structured JSON responses + auth context.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile, SubscriptionTier } from "@/lib/database.types";

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
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
  tier: SubscriptionTier;
}

/**
 * Resolve the authenticated context for a Route Handler. Returns either a
 * ready-to-return error response or the live context.
 */
export async function getAuthContext(): Promise<
  { error: NextResponse; ctx?: never } | { ctx: AuthContext; error?: never }
> {
  if (!isSupabaseConfigured) {
    return {
      error: apiError(
        "NOT_CONFIGURED",
        "Accounts are not enabled on this deployment."
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: apiError("UNAUTHENTICATED", "Please sign in to continue.") };
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email })
      .select("*")
      .single();
    profile = created;
  }

  if (!profile) {
    return { error: apiError("SERVER_ERROR", "Could not load your profile.") };
  }

  const typed = profile as Profile;
  return {
    ctx: { supabase, user, profile: typed, tier: typed.subscription_tier },
  };
}

/**
 * Soft variant: returns the auth context if the user is signed in, otherwise
 * null. Used by the core AI features, which still work anonymously when no one
 * is logged in (or Supabase is not configured).
 */
export async function getOptionalAuthContext(): Promise<AuthContext | null> {
  if (!isSupabaseConfigured) return null;
  const result = await getAuthContext();
  return result.ctx ?? null;
}
