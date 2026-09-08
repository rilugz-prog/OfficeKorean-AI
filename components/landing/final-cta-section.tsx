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
    <section className="py-24 sm:py-36">
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
            <h2 className="text-[2.25rem] leading-[1.15] sm:text-5xl">
              Write Korean You&apos;ll Be Proud to{" "}
              <em className="text-amber-200">Send</em>
            </h2>
            <p className="mt-6 text-lg font-light leading-relaxed text-white/80">
              Join the free beta and send your next Korean email with confidence
              — in the next 60 seconds.
            </p>

            <div className="mt-10">
              <Button
                size="lg"
                variant="secondary"
                className="cta-editorial h-[3.25rem] bg-white px-10 text-primary hover:bg-white/90"
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
