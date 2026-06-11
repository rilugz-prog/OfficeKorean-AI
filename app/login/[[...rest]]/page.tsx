"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginView />
    </React.Suspense>
  );
}

function LoginView() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-grid-radial">
      <header className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Languages className="h-4 w-4" />
          </span>
          SeoroAI
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your SeoroAI account
          </p>
        </div>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          fallbackRedirectUrl={next}
          appearance={{
            variables: { colorPrimary: "hsl(221.2 83.2% 53.3%)" },
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border bg-card",
            },
          }}
        />
      </main>
    </div>
  );
}
