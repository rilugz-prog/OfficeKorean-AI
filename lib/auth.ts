// ---------------------------------------------------------------------------
// Server-side auth helpers. Used by Server Components and Route Handlers.
// ---------------------------------------------------------------------------

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Returns the current user or null. Never throws. */
export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user, redirecting to /login if unauthenticated. */
export async function requireUser(nextPath?: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${params}`);
  }
  return user;
}

/** Returns the current user's profile, or null. */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

/** Returns the current user + profile, redirecting to /login if needed. */
export async function requireProfile(
  nextPath?: string
): Promise<{ user: User; profile: Profile }> {
  const user = await requireUser(nextPath);
  const supabase = await createClient();
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Defensive: create a profile if the signup trigger didn't (e.g. legacy user).
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email })
      .select("*")
      .single();
    profile = created;
  }

  return { user, profile: profile as Profile };
}
