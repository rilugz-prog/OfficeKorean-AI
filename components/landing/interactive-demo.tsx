"use client";

import * as React from "react";
import {
  Check,
  FileText,
  Languages,
  Mail,
  MessageSquare,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ToneId = "casual" | "polite" | "formal";

interface Variant {
  text: string;
  notes: string[];
}

interface Scenario {
  id: string;
  label: string;
  icon: LucideIcon;
  draft: string;
  variants: Record<ToneId, Variant>;
}

const TONES: { id: ToneId; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "polite", label: "Polite" },
  { id: "formal", label: "Formal" },
];

const SCENARIOS: Scenario[] = [
  {
    id: "email",
    label: "Email",
    icon: Mail,
    draft: "보고서 보냈어요. 확인해요.",
    variants: {
      casual: {
        text: "보고서 보냈어요. 시간 될 때 확인해 주세요.",
        notes: [
          "Softened the abrupt 확인해요 into a request",
          "Friendly register that still works with close colleagues",
        ],
      },
      polite: {
        text: "보고서를 보내드립니다. 확인 부탁드립니다.",
        notes: [
          "Applied the humble form 보내드립니다",
          "확인 부탁드립니다 is the standard polite request",
        ],
      },
      formal: {
        text: "안녕하세요. 요청하신 보고서를 첨부하여 보내드립니다. 검토 후 회신 부탁드립니다.",
        notes: [
          "Added a proper greeting and context",
          "첨부하여 signals the attachment explicitly",
          "Closed with a clear next step",
        ],
      },
    },
  },
  {
    id: "message",
    label: "Message",
    icon: MessageSquare,
    draft: "회의 늦어요.",
    variants: {
      casual: {
        text: "회의에 조금 늦을 것 같아요. 먼저 시작해 주세요!",
        notes: [
          "-을 것 같아요 softens a blunt statement",
          "Tells the team what to do instead of just apologising",
        ],
      },
      polite: {
        text: "회의에 조금 늦을 것 같습니다. 먼저 시작해 주시면 감사하겠습니다.",
        notes: [
          "Switched to the -습니다 register",
          "감사하겠습니다 closes the request politely",
        ],
      },
      formal: {
        text: "부득이한 사정으로 회의에 다소 늦을 것 같습니다. 먼저 진행해 주시면 감사하겠습니다.",
        notes: [
          "부득이한 사정 gives a professional reason",
          "다소 and 진행 read more formally than 조금 and 시작",
        ],
      },
    },
  },
  {
    id: "report",
    label: "Report",
    icon: FileText,
    draft: "이번 달 매출 많이 늘었어요.",
    variants: {
      casual: {
        text: "이번 달 매출이 많이 늘었어요.",
        notes: [
          "Added the missing subject marker 이",
          "Fine for internal notes and quick updates",
        ],
      },
      polite: {
        text: "이번 달 매출이 크게 증가했습니다.",
        notes: [
          "증가했습니다 is the expected reporting verb",
          "크게 replaces the colloquial 많이",
        ],
      },
      formal: {
        text: "금월 매출은 전월 대비 크게 증가하였습니다.",
        notes: [
          "금월 / 전월 대비 is standard report vocabulary",
          "증가하였습니다 is the formal written form",
        ],
      },
    },
  },
];

/** Tracks the user's OS-level motion preference, reactively. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface InteractiveDemoProps {
  className?: string;
  /**
   * Cycle once through the three tones on mount to show the product working.
   * Any user interaction cancels it and hands over control.
   */
  autoPlay?: boolean;
}

export function InteractiveDemo({ className, autoPlay = false }: InteractiveDemoProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [scenarioId, setScenarioId] = React.useState(SCENARIOS[0].id);
  const [tone, setTone] = React.useState<ToneId>("casual");
  const [autoPlaying, setAutoPlaying] = React.useState(autoPlay);

  const scenario =
    SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
  const variant = scenario.variants[tone];

  // Hand control to the user the moment they touch any control.
  const takeControl = React.useCallback(() => setAutoPlaying(false), []);

  // Autoplay walks the tones once, then stops rather than looping forever.
  React.useEffect(() => {
    if (!autoPlaying || prefersReducedMotion) return;

    const index = TONES.findIndex((item) => item.id === tone);
    if (index === TONES.length - 1) {
      setAutoPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTone(TONES[index + 1].id);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [autoPlaying, tone, prefersReducedMotion]);

  // Typewriter for the suggested output. The nonce lets Replay re-run the
  // effect even when the text itself has not changed.
  const [typed, setTyped] = React.useState(variant.text);
  const [replayNonce, setReplayNonce] = React.useState(0);
  const isTyping = typed.length < variant.text.length;

  React.useEffect(() => {
    const full = variant.text;

    if (prefersReducedMotion) {
      setTyped(full);
      return;
    }

    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(full.slice(0, index));
      if (index >= full.length) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [variant.text, prefersReducedMotion, replayNonce]);

  const replay = () => {
    takeControl();
    setReplayNonce((n) => n + 1);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-black/5",
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
        <div className="ml-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          SeoroAI · Live preview
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {/* Scenario picker */}
        <div>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            id="demo-scenario-label"
          >
            What are you writing?
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="demo-scenario-label"
          >
            {SCENARIOS.map((item) => {
              const active = item.id === scenario.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    takeControl();
                    setScenarioId(item.id);
                  }}
                  className={cn(
                    "inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Draft input */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Your draft
          </p>
          <p lang="ko" className="text-sm text-foreground/70">
            {scenario.draft}
          </p>
        </div>

        {/* Tone picker */}
        <div>
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            id="demo-tone-label"
          >
            Choose a tone
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="demo-tone-label"
          >
            {TONES.map((item) => {
              const active = item.id === tone;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    takeControl();
                    setTone(item.id);
                  }}
                  className={cn(
                    "inline-flex h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggested output — min-height reserves space so nothing jumps. */}
        <div className="min-h-[7.5rem] rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              SeoroAI suggestion
            </p>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay the suggestion animation"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Animated text is decorative; the live region below carries the value. */}
          <p
            lang="ko"
            aria-hidden="true"
            className="text-sm font-medium leading-relaxed text-foreground"
          >
            {typed}
            {isTyping && (
              <span
                className="caret-blink ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-primary align-middle"
              />
            )}
          </p>

          <p lang="ko" className="sr-only" aria-live="polite">
            {variant.text}
          </p>
        </div>

        {/* What changed — min-height keeps the card stable across variants. */}
        <ul className="min-h-[4.5rem] space-y-2">
          {variant.notes.map((note) => (
            <li
              key={note}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span
                className="mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600"
                aria-hidden="true"
              >
                <Check className="h-3 w-3" />
              </span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
