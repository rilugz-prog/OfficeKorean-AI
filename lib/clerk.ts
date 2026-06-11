// ---------------------------------------------------------------------------
// Clerk configuration helpers.
//
// Centralizes Clerk's server entry points and the public routing constants so
// the rest of the app imports them from one place. `isClerkConfigured` mirrors
// the old `isSupabaseConfigured` flag: when Clerk keys are absent the app still
// builds and the anonymous AI features keep working.
// ---------------------------------------------------------------------------

export { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/login";
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/register";
export const AFTER_SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/dashboard";

export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);
