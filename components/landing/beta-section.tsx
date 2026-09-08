import Link from "next/link";
import { Gift, Star, MessagesSquare, Rocket, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: Gift,
    title: "Free Beta Access",
    description: "Use SeoroAI completely free while we're in beta.",
  },
  {
    icon: Star,
    title: "Priority Feature Requests",
    description: "Your ideas shape the roadmap and get built first.",
  },
  {
    icon: MessagesSquare,
    title: "Direct Founder Communication",
    description: "Talk directly with the team building SeoroAI.",
  },
  {
    icon: Rocket,
    title: "Early Adopter Benefits",
    description: "Lock in perks and rewards reserved for our first users.",
  },
];

export function BetaSection() {
  return (
    <section className="bg-muted/30 py-24 sm:py-36">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-600">
            <Rocket className="h-4 w-4" /> Limited Beta
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Become a SeoroAI Beta Tester
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join early, help shape the product, and get rewarded for it.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/register">
              Start Free Beta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
