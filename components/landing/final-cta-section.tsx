import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

const POINTS = [
  "Free Beta Access",
  "No Credit Card Required",
  "Cancel Anytime",
];

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 px-6 py-16 text-center text-white shadow-xl sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="bg-grid-radial pointer-events-none absolute inset-0 opacity-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Write Korean You'll Be Proud to Send
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join the free beta and send your next Korean email with confidence
              — in the next 60 seconds.
            </p>

            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 bg-white text-base text-primary hover:bg-white/90"
                aria-label="Start the free beta — create your account"
                asChild
              >
                <Link href="/register">
                  Start Writing Free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-1.5 text-sm text-white/80"
                >
                  <Check className="h-4 w-4" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
