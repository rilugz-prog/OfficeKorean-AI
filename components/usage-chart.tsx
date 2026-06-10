"use client";

// ---------------------------------------------------------------------------
// Lightweight dependency-free charts for the dashboard. SVG/flex based so we
// avoid pulling a heavy charting library.
// ---------------------------------------------------------------------------

import * as React from "react";
import type { FeatureType } from "@/lib/database.types";
import { cn } from "@/lib/utils";

interface TrendRow {
  feature_type: FeatureType;
  usage_count: number;
  usage_date: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Weekly stacked-by-total usage as a simple bar chart (last 7 days). */
export function WeeklyUsageChart({ trend }: { trend: TrendRow[] }) {
  const days = React.useMemo(() => {
    const result: { date: string; label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const total = trend
        .filter((t) => t.usage_date === iso)
        .reduce((sum, t) => sum + t.usage_count, 0);
      result.push({ date: iso, label: DAY_LABELS[d.getDay()], total });
    }
    return result;
  }, [trend]);

  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="flex h-40 items-end gap-2">
      {days.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="relative flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
              style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }}
              title={`${d.total} actions on ${d.date}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
          <span className="text-[10px] font-medium tabular-nums">{d.total}</span>
        </div>
      ))}
    </div>
  );
}

/** A horizontal usage meter for a single feature. */
export function UsageMeter({
  label,
  used,
  limit,
  period,
}: {
  label: string;
  used: number;
  limit: number | null;
  period?: string;
}) {
  const unlimited = limit === null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const near = !unlimited && pct >= 80;
  const reached = !unlimited && used >= (limit ?? 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {unlimited ? (
            <span className="text-primary">Unlimited</span>
          ) : (
            <>
              {used}/{limit}
              {period ? ` · ${period}` : ""}
            </>
          )}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              reached ? "bg-destructive" : near ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
