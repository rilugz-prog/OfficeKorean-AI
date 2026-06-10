"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  Loader2,
  BookMarked,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { useSavedPhrases } from "@/hooks/use-saved-phrases";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { ApiClientError } from "@/lib/client-api";
import { PHRASE_CATEGORIES } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { SavedPhrase } from "@/lib/database.types";

const FILTER_CATEGORIES = ["All", ...PHRASE_CATEGORIES];

export default function PhrasesPage() {
  const {
    items,
    limit,
    loading,
    filters,
    updateFilters,
    create,
    update,
    toggleFavorite,
    remove,
  } = useSavedPhrases({ sort: "newest" });
  const { open: openUpgrade } = useUpgradeModal();

  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SavedPhrase | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => updateFilters({ q: search }), 350);
    return () => clearTimeout(t);
  }, [search, updateFilters]);

  const atLimit =
    limit?.max != null && limit.remaining != null && limit.remaining <= 0;

  function openCreate() {
    if (atLimit) {
      openUpgrade({
        reason: `You've reached your saved-phrase limit (${limit?.max}).`,
        currentUsage: `${limit?.used}/${limit?.max} phrases`,
      });
      return;
    }
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(phrase: SavedPhrase) {
    setEditing(phrase);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phrase Library"
        description={
          limit?.max != null
            ? `${limit.used}/${limit.max} phrases saved.`
            : `${items.length} phrases saved.`
        }
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New phrase
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search phrases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.category ?? "All"}
            onValueChange={(v) => updateFilters({ category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={filters.favorites ? "default" : "outline"}
            onClick={() => updateFilters({ favorites: !filters.favorites })}
          >
            <Star className={cn("h-4 w-4", filters.favorites && "fill-current")} />
            Favorites
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BookMarked className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No phrases yet. Save your go-to workplace messages for quick reuse.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create your first phrase
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{p.title}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {p.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle favorite"
                    onClick={() => toggleFavorite(p.id, !p.is_favorite)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        p.is_favorite && "fill-amber-400 text-amber-400"
                      )}
                    />
                  </Button>
                </div>
                <p className="flex-1 whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-sm">
                  {p.phrase_content}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <CopyButton value={p.phrase_content} />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PhraseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onCreate={create}
        onUpdate={update}
        onLimit={(msg) => openUpgrade({ reason: msg })}
      />
    </div>
  );
}

function PhraseDialog({
  open,
  onOpenChange,
  editing,
  onCreate,
  onUpdate,
  onLimit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SavedPhrase | null;
  onCreate: ReturnType<typeof useSavedPhrases>["create"];
  onUpdate: ReturnType<typeof useSavedPhrases>["update"];
  onLimit: (msg: string) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<string>("Custom");
  const [content, setContent] = React.useState("");
  const [language, setLanguage] = React.useState<"ko" | "en">("ko");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setCategory(editing?.category ?? "Custom");
      setContent(editing?.phrase_content ?? "");
      setLanguage((editing?.language as "ko" | "en") ?? "ko");
      setError(null);
    }
  }, [open, editing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await onUpdate({
          id: editing.id,
          title,
          category,
          phrase_content: content,
          language,
        });
      } else {
        await onCreate({ title, category, phrase_content: content, language });
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "PHRASE_LIMIT_REACHED") {
        onOpenChange(false);
        onLimit(err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not save phrase.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit phrase" : "New phrase"}</DialogTitle>
          <DialogDescription>
            Save reusable workplace messages to your library.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Polite leave request"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHRASE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as "ko" | "en")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Phrase</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px]"
              placeholder="Type or paste the phrase…"
              required
            />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !content.trim()}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                "Save changes"
              ) : (
                "Create phrase"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
