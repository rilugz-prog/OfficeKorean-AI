"use client";

// ---------------------------------------------------------------------------
// useAuth — session state + sign-out, backed by Clerk.
//
// Sign-in / sign-up / password-reset are handled by Clerk's prebuilt <SignIn>
// and <SignUp> components on /login and /register, so this hook only exposes
// the current session and a sign-out action for the app chrome.
// ---------------------------------------------------------------------------

import * as React from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const signOut = React.useCallback(
    async (redirectUrl = "/login") => {
      await clerkSignOut({ redirectUrl });
    },
    [clerkSignOut]
  );

  return {
    user: user ?? null,
    loading: !isLoaded,
    isAuthenticated: Boolean(isSignedIn),
    signOut,
  };
}
