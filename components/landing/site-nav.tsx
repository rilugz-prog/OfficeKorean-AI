"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, PenLine } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "FAQ", href: "#faq" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-background/80 backdrop-blur transition-all",
        scrolled && "border-border shadow-sm"
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground">
            <PenLine className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-base font-normal uppercase tracking-[0.28em] text-foreground">
              Seoro<span className="text-primary">AI</span>
            </span>
            <span className="mt-1 hidden text-[0.5rem] font-medium uppercase tracking-[0.3em] text-muted-foreground sm:block">
              Korean Writing Assistant
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <Button variant="ghost" size="sm" className="cta-editorial px-4" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="cta-editorial px-5" asChild>
              <Link href="/register">Start Free Beta</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="sm" className="cta-editorial px-5" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <SignedOut>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Start Free Beta
                  </Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
