"use client";

import * as React from "react";
import { Search, Star, Trash2, Loader2, Inbox } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { FEATURE_META } from "@/components/feature-meta";
import { useHistory, type HistoryFilters } from "@/hooks/use-history";
import { cn } from "@/lib/utils";
import type { FeatureType } from "@/lib/database.types";

export default function HistoryPage() {
  const {
    items,
    total,
    loading,
    filters,
    updateFilters,
    toggleFavorite,
    remove,
  } = useHistory({ sort: "newest" });

  const [search, setSearch] = React.useState("");

  // Debounce the search input into the filter.
  React.useEffect(() => {
    const t = setTimeout(() => updateFilters({ q: search }), 350);
    return () => clearTimeout(t);
  }, [search, updateFilters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description={`${total} saved item${total === 1 ? "" : "s"} across all features.`}
      />

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.feature ?? "all"}
            onValueChange={(v) =>
              updateFilters({ feature: v as FeatureType | "all" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All features</SelectItem>
              <SelectItem value="translation">Translation</SelectItem>
              <SelectItem value="cultural_filter">Cultural Filter</SelectItem>
              <SelectItem value="explain_korean">Explain Korean</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort ?? "newest"}
            onValueChange={(v) =>
              updateFilters({ sort: v as HistoryFilters["sort"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={filters.favorites ? "default" : "outline"}
            onClick={() => updateFilters({ favorites: !filters.favorites })}
          >
            <Star
              className={cn("h-4 w-4", filters.favorites && "fill-current")}
            />
            Favorites
          </Button>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <Input
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => updateFilters({ from: e.target.value })}
              aria-label="From date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => updateFilters({ to: e.target.value })}
              aria-label="To date"
            />
            {(filters.from || filters.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ from: undefined, to: undefined })}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No history matches your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = FEATURE_META[item.feature_type];
            const Icon = meta.icon;
            return (
              <Card key={item.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={cn("gap-1", meta.badgeClass)}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle favorite"
                        onClick={() => toggleFavorite(item.id, !item.is_favorite)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            item.is_favorite && "fill-amber-400 text-amber-400"
                          )}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Input
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {item.input_text}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Output
                      </p>
                      <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-sm">
                        {item.output_text}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <CopyButton value={item.output_text} label="Copy output" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
