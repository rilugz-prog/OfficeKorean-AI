import Link from "next/link";
import type { Metadata } from "next";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import type { SubscriptionTier } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Pricing — SeoroAI",
  description:
    "Simple plans for professionals communicating in Korean. Start free, upgrade when you need more.",
};

const ICON: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  premium: <Crown className="h-5 w-5" />,
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main className="container py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing that scales with you
          </h1>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade to Pro or Premium for unlimited translations,
            cultural filtering, and message decoding.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLAN_ORDER.map((tier) => {
            const plan = PLANS[tier];
            const featured = tier === "pro";
            return (
              <div
                key={tier}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                  featured && "border-primary shadow-md lg:scale-[1.03]"
                )}
              >
                {featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-primary">{ICON[tier]}</span> {plan.name}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="mt-6">
                  <Button
                    className="w-full"
                    variant={featured ? "default" : "outline"}
                  >
                    {tier === "free" ? "Get started free" : `Choose ${plan.name}`}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Payments &amp; subscriptions —{" "}
          <span className="font-medium">Stripe Integration Coming in Phase 3</span>.
        </p>
      </main>
    </div>
  );
}
