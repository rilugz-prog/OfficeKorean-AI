"use client";

import * as React from "react";
import Link from "next/link";
import {
  Languages,
  Sparkles,
  BookOpen,
  BookMarked,
  Star,
  History as HistoryIcon,
  ArrowRight,
  Crown,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyUsageChart, UsageMeter } from "@/components/usage-chart";
import { FEATURE_META } from "@/components/feature-meta";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { useUsage } from "@/hooks/use-usage";
import { useHistory } from "@/hooks/use-history";
import { FEATURE_LABELS } from "@/lib/plans";
import type { FeatureType } from "@/lib/database.types";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading } = useUsage();
  const { items: recent, loading: recentLoading } = useHistory({ sort: "newest" });
  const { open } = useUpgradeModal();

  const featureUsage = (f: FeatureType) =>
    data?.features.find((x) => x.feature === f);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your usage, activity and plan at a glance."
        action={
          data && data.tier !== "premium" ? (
            <Button
              onClick={() =>
                open({ currentTier: data.tier, reason: "Unlock more capacity." })
              }
            >
              <Crown className="h-4 w-4" /> Upgrade
            </Button>
          ) : undefined
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))
        ) : (
          <>
            <StatCard
              label="Translations"
              value={featureUsage("translation")?.used ?? 0}
              icon={Languages}
            />
            <StatCard
              label="Cultural filters"
              value={featureUsage("cultural_filter")?.used ?? 0}
              icon={Sparkles}
            />
            <StatCard
              label="Explain Korean"
              value={featureUsage("explain_korean")?.used ?? 0}
              icon={BookOpen}
            />
            <StatCard
              label="Saved phrases"
              value={`${data.phrases.used}${data.phrases.limit ? `/${data.phrases.limit}` : ""}`}
              icon={BookMarked}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan + limits */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current plan
              {data && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" /> {data.plan.name}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Usage against your plan limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading || !data ? (
              <Skeleton className="h-40" />
            ) : (
              <>
                {data.features.map((f) => (
                  <UsageMeter
                    key={f.feature}
                    label={FEATURE_LABELS[f.feature]}
                    used={f.used}
                    limit={f.limit}
                    period={f.period === "month" ? "this month" : "today"}
                  />
                ))}
                <UsageMeter
                  label="Saved phrases"
                  used={data.phrases.used}
                  limit={data.phrases.limit}
                />
                {data.tier !== "premium" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => open({ currentTier: data.tier })}
                  >
                    Upgrade for more
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Weekly usage chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Activity this week
            </CardTitle>
            <CardDescription>Total actions per day over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <Skeleton className="h-40" />
            ) : (
              <WeeklyUsageChart trend={data.trend} />
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="h-4 w-4" /> {data?.counts.favorites ?? 0} favorites
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <HistoryIcon className="h-4 w-4" /> {data?.counts.history ?? 0} total in history
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent activity
            <Link href="/history">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity yet. Try the{" "}
              <Link href="/" className="underline underline-offset-4">
                translator
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.slice(0, 6).map((item) => {
                const meta = FEATURE_META[item.feature_type];
                const Icon = meta.icon;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.input_text}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {meta.label} ·{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {item.is_favorite && (
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
