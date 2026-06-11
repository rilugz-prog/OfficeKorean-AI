"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Persistent bottom CTA shown only on mobile, where the hero CTA scrolls out
 * of view. Keeps the primary conversion action one tap away at all times.
 */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <SignedOut>
        <Button size="lg" className="h-12 w-full text-base" asChild>
          <Link href="/register" aria-label="Start the free beta">
            Start Writing Free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button size="lg" className="h-12 w-full text-base" asChild>
          <Link href="/translate">
            Open Translator
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </SignedIn>
    </div>
  );
}
