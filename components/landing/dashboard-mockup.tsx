import { Check, Sparkles, Wand2, FileText, Languages } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A purely presentational SaaS dashboard mockup used inside the hero and
 * solution sections. No interactivity — it just sells the product visually.
 */
export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-black/5",
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          SeoroAI · Professional Email Writer
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r bg-muted/20 p-4 sm:block">
          <div className="space-y-1 text-sm">
            {[
              { icon: Wand2, label: "Email Writer", active: true },
              { icon: Sparkles, label: "Tone Converter" },
              { icon: FileText, label: "Documents" },
              { icon: Languages, label: "Translate" },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 font-medium",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Formal · Business
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
              Polite tone
            </span>
          </div>

          {/* "Before" line */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Your draft
            </p>
            <p lang="ko" className="text-sm text-foreground/70">
              보고서 보냈어요. 확인해요.
            </p>
          </div>

          {/* "After" line */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> SeoroAI suggestion
            </p>
            <p
              lang="ko"
              className="text-sm font-medium leading-relaxed text-foreground"
            >
              안녕하세요. 보고서를 첨부하여 보내드립니다. 검토 부탁드립니다.
            </p>
          </div>

          {/* Suggestions list */}
          <div className="space-y-2">
            {[
              "More natural business phrasing",
              "Correct honorific (드립니다) applied",
              "Professional closing added",
            ].map((tip) => (
              <div
                key={tip}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                  <Check className="h-3 w-3" />
                </span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
