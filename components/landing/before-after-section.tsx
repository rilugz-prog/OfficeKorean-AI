import { ArrowRight, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";

const BEFORE = ["안녕하세요.", "보고서 보냈습니다.", "확인해주세요."];
const AFTER = [
  "안녕하세요.",
  "보고서를 첨부하여 보내드립니다.",
  "검토 부탁드립니다.",
];

export function BeforeAfterSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary to-blue-700 py-20 text-white sm:py-28">
      <div
        aria-hidden="true"
        className="bg-grid-radial pointer-events-none absolute inset-0 opacity-20"
      />

      <div className="container relative">
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

          {/* Arrow — points down on mobile (stacked), right on desktop */}
          <div className="mx-auto flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg md:rotate-0">
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </div>

          {/* After */}
          <div className="rounded-2xl border border-amber-400/40 bg-white p-6 text-foreground shadow-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
              <Sparkles className="h-3 w-3" /> After
            </span>
            <div className="mt-4 space-y-2">
              {AFTER.map((line, i) => (
                <p
                  key={i}
                  lang="ko"
                  className="text-lg font-medium leading-relaxed"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
