"use client";

import * as React from "react";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  Mail,
  MessageSquareQuote,
  SlidersHorizontal,
  SpellCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Shown when the card is expanded. */
  before?: string;
  after: string;
  takeaway: string;
}

const FEATURES: Feature[] = [
  {
    icon: Mail,
    title: "Professional Email Writer",
    description:
      "Generate clear, polite, and professional Korean emails for any workplace situation.",
    after: "회의 일정 변경 안내드립니다. 자세한 내용은 아래를 참고해 주시기 바랍니다.",
    takeaway: "안내드립니다 is the standard opening for a workplace notice.",
  },
  {
    icon: SlidersHorizontal,
    title: "Tone Converter",
    description:
      "Switch instantly between casual, polite, and formal business Korean.",
    before: "확인 부탁해요.",
    after: "확인 부탁드립니다.",
    takeaway: "부탁드립니다 raises the register without sounding stiff.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Enhancement",
    description:
      "Catch grammar mistakes and fix awkward phrasing automatically.",
    before: "회의를 참석하겠습니다.",
    after: "회의에 참석하겠습니다.",
    takeaway: "참석하다 takes the particle 에, not 를 — a very common slip.",
  },
  {
    icon: MessageSquareQuote,
    title: "Natural Korean Expressions",
    description:
      "Replace stiff translations with expressions native speakers actually use.",
    before: "당신의 도움에 감사합니다.",
    after: "도움 주셔서 감사합니다.",
    takeaway: "당신 reads as a literal translation of “you” and is rarely used at work.",
  },
  {
    icon: FileText,
    title: "Document Assistant",
    description:
      "Draft reports, notices, and workplace documents with confidence.",
    after: "아래와 같이 보고드립니다.",
    takeaway: "A conventional lead-in that signals a structured report follows.",
  },
  {
    icon: GraduationCap,
    title: "Korean Learning Support",
    description:
      "Understand why each suggestion works so your Korean keeps improving.",
    before: "수고하세요.",
    after: "고생 많으셨습니다.",
    takeaway: "수고하세요 is best avoided upward — it can read as condescending.",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [open, setOpen] = React.useState(false);
  const panelId = `feature-panel-${index}`;

  return (
    <Reveal delay={index * 70}>
      <div
        className={cn(
          "h-full rounded-lg border bg-card transition-colors duration-200",
          open ? "border-primary/40" : "border-border/60 hover:border-primary/30"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full cursor-pointer items-start gap-4 rounded-lg p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            className={cn(
              "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
              open
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            <feature.icon className="h-6 w-6" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold text-foreground">
              {feature.title}
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">
              {feature.description}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {open ? "Hide example" : "See example"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open && "rotate-180"
                )}
                aria-hidden="true"
              />
            </span>
          </span>
        </button>

        {/* 0fr -> 1fr animates height without measuring the content. */}
        <div
          id={panelId}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 border-t px-6 py-4">
              {feature.before && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Before
                  </p>
                  <p
                    lang="ko"
                    className="mt-1 text-sm text-muted-foreground line-through decoration-destructive/50"
                  >
                    {feature.before}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {feature.before ? "After" : "Example"}
                </p>
                <p
                  lang="ko"
                  className="mt-1 text-sm font-medium leading-relaxed text-foreground"
                >
                  {feature.after}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">{feature.takeaway}</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything You Need to Write Better Korean"
            description="A complete toolkit for natural, professional Korean communication. Tap any card to see it in action."
          />
        </Reveal>

        <div className="mt-14 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
