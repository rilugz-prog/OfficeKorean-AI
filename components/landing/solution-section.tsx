import { Sparkles, Zap, ShieldCheck } from "lucide-react";

import { DashboardMockup } from "@/components/landing/dashboard-mockup";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant rewrites",
    description: "Turn rough drafts into polished Korean in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Workplace-ready",
    description: "Correct honorifics and tone for real business settings.",
  },
  {
    icon: Sparkles,
    title: "Natural phrasing",
    description: "Sounds like a fluent native speaker — not a machine.",
  },
];

export function SolutionSection() {
  return (
    <section id="demo" className="py-20 sm:py-28">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Mockup */}
          <div className="order-2 lg:order-1">
            <DashboardMockup />
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              The Solution
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet SeoroAI
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              SeoroAI acts as your AI-powered Korean writing assistant, helping
              you communicate naturally and professionally.
            </p>

            <ul className="mt-8 space-y-5">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
