"use client";

import * as React from "react";
import {
  LayoutTemplate,
  Loader2,
  Wand2,
  ChevronRight,
  Save,
  Check,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { useTemplates } from "@/hooks/use-templates";
import { useSavedPhrases } from "@/hooks/use-saved-phrases";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { ApiClientError } from "@/lib/client-api";
import type { Template } from "@/lib/database.types";
import type { TemplateGenerateResponse } from "@/types";

export default function TemplatesPage() {
  const { grouped, loading, generate } = useTemplates();
  const [active, setActive] = React.useState<Template | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Center"
        description="Generate ready-to-send Korean & English workplace messages in seconds."
      />

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <LayoutTemplate className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No templates available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-lg font-semibold">{group.category}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t)}
                    className="group flex flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                    {!t.is_system && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        Custom
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <GenerateDialog
        template={active}
        onClose={() => setActive(null)}
        generate={generate}
      />
    </div>
  );
}

function GenerateDialog({
  template,
  onClose,
  generate,
}: {
  template: Template | null;
  onClose: () => void;
  generate: ReturnType<typeof useTemplates>["generate"];
}) {
  const { open: openUpgrade } = useUpgradeModal();
  const { create: createPhrase } = useSavedPhrases();

  const [name, setName] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [project, setProject] = React.useState("");
  const [situation, setSituation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TemplateGenerateResponse | null>(null);
  const [saved, setSaved] = React.useState(false);

  const isOpen = template !== null;

  React.useEffect(() => {
    if (template) {
      setName("");
      setDepartment("");
      setProject("");
      setSituation("");
      setResult(null);
      setError(null);
      setSaved(false);
    }
  }, [template]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generate({
        template_id: template.id,
        template_title: template.title,
        category: template.category,
        name: name || undefined,
        department: department || undefined,
        project: project || undefined,
        situation,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "LIMIT_REACHED") {
        onClose();
        openUpgrade({ reason: err.message });
        return;
      }
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onSavePhrase() {
    if (!result || !template) return;
    await createPhrase({
      title: template.title,
      category: mapCategory(template.category),
      phrase_content: result.korean,
      language: "ko",
    });
    setSaved(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> {template?.title}
          </DialogTitle>
          <DialogDescription>
            {template?.situation_hint ??
              "Describe your situation and we'll draft the message."}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={onGenerate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="t-name">Name</Label>
                <Input
                  id="t-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-dept">Department</Label>
                <Input
                  id="t-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-proj">Project</Label>
                <Input
                  id="t-proj"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-situation">Situation details</Label>
              <Textarea
                id="t-situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="min-h-[120px]"
                placeholder="e.g. I need next Monday and Tuesday off for a family matter; my tasks are covered by Jisoo."
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !situation.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Generate message
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <ResultBlock title="Professional Korean" value={result.korean} />
            <ResultBlock title="Professional English" value={result.english} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Cultural explanation</p>
              <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                {result.explanation}
              </p>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="outline" onClick={() => setResult(null)}>
                Start over
              </Button>
              <Button onClick={onSavePhrase} disabled={saved}>
                {saved ? (
                  <>
                    <Check className="h-4 w-4" /> Saved to library
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Korean to library
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <CopyButton value={value} />
      </div>
      <p className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
        {value}
      </p>
    </div>
  );
}

// Map a template category to a valid saved-phrase category.
function mapCategory(category: string): string {
  const allowed = [
    "Leave Request",
    "Meeting",
    "Status Update",
    "Approval Request",
    "Delay Notification",
    "Client Communication",
    "HR Communication",
  ];
  return allowed.includes(category) ? category : "Custom";
}
