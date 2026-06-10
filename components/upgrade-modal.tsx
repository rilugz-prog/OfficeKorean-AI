"use client";

// ---------------------------------------------------------------------------
// Reusable paywall / upgrade modal.
//
// Wrap a subtree in <UpgradeModalProvider> and call useUpgradeModal().open()
// from anywhere (e.g. when an API returns LIMIT_REACHED) to surface the modal.
// Stripe checkout is intentionally stubbed for Phase 3.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import type { SubscriptionTier } from "@/lib/database.types";

interface OpenOptions {
  reason?: string;
  currentTier?: SubscriptionTier;
  currentUsage?: string;
}

interface UpgradeModalContextValue {
  open: (options?: OpenOptions) => void;
  close: () => void;
}

const UpgradeModalContext =
  React.createContext<UpgradeModalContextValue | null>(null);

export function useUpgradeModal() {
  const ctx = React.useContext(UpgradeModalContext);
  if (!ctx) {
    throw new Error("useUpgradeModal must be used within <UpgradeModalProvider>");
  }
  return ctx;
}

const TIER_ICON: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-4 w-4" />,
  pro: <Sparkles className="h-4 w-4" />,
  premium: <Crown className="h-4 w-4" />,
};

export function UpgradeModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<OpenOptions>({});

  const open = React.useCallback((opts?: OpenOptions) => {
    setOptions(opts ?? {});
    setIsOpen(true);
  }, []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const currentTier = options.currentTier ?? "free";
  const paidPlans = PLAN_ORDER.filter((t) => t !== "free").map((t) => PLANS[t]);

  return (
    <UpgradeModalContext.Provider value={{ open, close }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" /> Upgrade your plan
            </DialogTitle>
            <DialogDescription>
              {options.reason ??
                "You've hit a limit on your current plan. Upgrade for more capacity."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current plan:</span>
            <Badge variant="secondary" className="gap-1">
              {TIER_ICON[currentTier]} {PLANS[currentTier].name}
            </Badge>
            {options.currentUsage && (
              <span className="text-muted-foreground">· {options.currentUsage}</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {paidPlans.map((plan) => {
              const isCurrent = plan.tier === currentTier;
              const featured = plan.tier === "pro";
              return (
                <div
                  key={plan.tier}
                  className={cn(
                    "relative rounded-xl border p-5",
                    featured && "border-primary shadow-sm"
                  )}
                >
                  {featured && (
                    <Badge className="absolute -top-2.5 right-4">Popular</Badge>
                  )}
                  <div className="flex items-center gap-2 font-semibold">
                    {TIER_ICON[plan.tier]} {plan.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.tagline}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 w-full"
                    variant={featured ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => {
                      // Stripe checkout placeholder.
                      alert(
                        `Stripe Integration Coming in Phase 3 — selected ${plan.name}.`
                      );
                    }}
                  >
                    {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Stripe Integration Coming in Phase 3
          </p>
        </DialogContent>
      </Dialog>
    </UpgradeModalContext.Provider>
  );
}
