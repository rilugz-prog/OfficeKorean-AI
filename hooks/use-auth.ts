"use client";

// ---------------------------------------------------------------------------
// useAuth — session state + auth actions backed by Supabase.
// ---------------------------------------------------------------------------

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AuthResult {
  error: string | null;
}

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectBase =
    typeof window !== "undefined" ? window.location.origin : "";

  const signInWithPassword = React.useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    []
  );

  const signUp = React.useCallback(
    async (
      email: string,
      password: string,
      fullName?: string
    ): Promise<AuthResult> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${redirectBase}/auth/callback`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      return { error: error?.message ?? null };
    },
    [redirectBase]
  );

  const signInWithGoogle = React.useCallback(
    async (next = "/dashboard"): Promise<AuthResult> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      return { error: error?.message ?? null };
    },
    [redirectBase]
  );

  const resetPassword = React.useCallback(
    async (email: string): Promise<AuthResult> => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectBase}/reset-password`,
      });
      return { error: error?.message ?? null };
    },
    [redirectBase]
  );

  const updatePassword = React.useCallback(
    async (password: string): Promise<AuthResult> => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    },
    []
  );

  const signOut = React.useCallback(async (): Promise<AuthResult> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isConfigured: isSupabaseConfigured,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
  };
}
