import Link from "next/link";
import { ArrowRight, Play, Check, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/landing/interactive-demo";

const TRUST = [
  "Free during beta",
  "No credit card",
  "Direct founder support",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-grid-radial pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative py-14 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="animate-fade-in-up text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
              <span aria-hidden="true">🇰🇷</span> Built for expats and Korean
              learners
            </span>

            <h1 className="mt-6 text-[1.85rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Write professional Korean emails, reports, and workplace messages{" "}
              <span className="text-primary">in seconds.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground lg:mx-0">
              SeoroAI is your AI-powered Korean writing assistant — built for
              expats, students, and professionals who want to sound natural and
              confident in Korean.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                className="h-12 w-full text-base sm:w-auto"
                aria-label="Start the free beta — create your account"
                asChild
              >
                <Link href="/register">
                  Start Writing Free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full text-base sm:w-auto"
                asChild
              >
                <a href="#demo" aria-label="Watch the product demo">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Watch Demo
                </a>
              </Button>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Set up in under 60 seconds. No credit card required.
            </p>

            {/* Limited beta callout */}
            <div className="mt-6 inline-flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-left">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                <Rocket className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Limited Beta Access
                </p>
                <p className="text-sm text-muted-foreground">
                  Join the first 20 users helping shape SeoroAI.
                </p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
              {TRUST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Live, playable preview — autoplays once, then hands over control. */}
          <div className="animate-fade-in-up [animation-delay:120ms]">
            <InteractiveDemo autoPlay />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Try it — switch the scenario and tone above.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
