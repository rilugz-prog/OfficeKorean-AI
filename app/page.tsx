"use client";

import * as React from "react";
import { Languages } from "lucide-react";

import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { Workspace, WorkspaceTab } from "@/components/workspace";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [tab, setTab] = React.useState<WorkspaceTab>("translate");
  const workspaceRef = React.useRef<HTMLDivElement>(null);

  function selectTab(next: WorkspaceTab) {
    setTab(next);
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Languages className="h-4 w-4" />
            </span>
            OfficeKorean AI
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <Hero />

        <div className="container space-y-12 py-12">
          <FeatureCards onSelect={selectTab} />

          <section ref={workspaceRef} className="scroll-mt-20">
            <Workspace value={tab} onValueChange={setTab} />
          </section>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          OfficeKorean AI · Powered by Claude Opus · Built for professionals in
          Korea
        </div>
      </footer>
    </div>
  );
}
