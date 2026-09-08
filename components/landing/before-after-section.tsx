"use client";

import * as React from "react";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/landing/section-heading";
import { useInView } from "@/components/landing/use-in-view";

const BEFORE = ["안녕하세요.", "보고서 보냈습니다.", "확인해주세요."];
const AFTER = [
  "안녕하세요.",
  "보고서를 첨부하여 보내드립니다.",
  "검토 부탁드립니다.",
];

export function BeforeAfterSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);

  // Run the transformation once the section scrolls into view, so it
  // demonstrates itself before the visitor has to touch anything.
  const inView = useInView(sectionRef);
  const [replayed, setReplayed] = React.useState<boolean | null>(null);

  // `replayed` takes over once the visitor presses the button.
  const transformed = replayed ?? inView;

  const replay = () => {
    setReplayed(false);
    // Let the exit state paint before animating back in.
    window.setTimeout(() => setReplayed(true), 60);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary to-blue-700 py-20 text-white sm:py-28">
      <div
        aria-hidden="true"
        className="bg-grid-radial pointer-events-none absolute inset-0 opacity-20"
      />

      <div className="container relative" ref={sectionRef}>
        <SectionHeading
          className="text-white [&_h2]:text-white"
          eyebrow=""
          title={
            <span className="text-white">
              Transform Basic Korean Into Professional Communication
            </span>
          }
        />

        <div className="mx-auto mt-14 grid max-w-4xl items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Before */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Before
            </span>
            <div className="mt-4 space-y-2">
              {BEFORE.map((line, i) => (
                <p key={i} lang="ko" className="text-lg text-white/80">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Trigger — points down on mobile (stacked), right on desktop */}
          <button
            type="button"
            onClick={replay}
            aria-label="Replay the transformation"
            className={cn(
              "mx-auto flex h-12 w-12 rotate-90 cursor-pointer items-center justify-center rounded-full bg-amber-500 text-white shadow-lg md:rotate-0",
              "transition-colors duration-200 hover:bg-amber-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            )}
          >
            {transformed ? (
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* After — lines rise in one after another. */}
          <div className="rounded-2xl border border-amber-400/40 bg-white p-6 text-foreground shadow-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> After
            </span>
            <div className="mt-4 space-y-2">
              {AFTER.map((line, i) => (
                <p
                  key={i}
                  lang="ko"
                  style={{ transitionDelay: `${i * 140}ms` }}
                  className={cn(
                    // `ba-line` is the hook the <noscript> fallback uses.
                    "ba-line text-lg font-medium leading-relaxed",
                    "transition-all duration-500 ease-out",
                    "motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
                    transformed
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Tap the arrow to replay the transformation.
        </p>
      </div>
    </section>
  );
}
