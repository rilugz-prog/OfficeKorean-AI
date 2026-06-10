"use client";

import * as React from "react";

import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { Workspace, WorkspaceTab } from "@/components/workspace";
import { MarketingHeader } from "@/components/marketing-header";

export default function Home() {
  const [tab, setTab] = React.useState<WorkspaceTab>("translate");
  const workspaceRef = React.useRef<HTMLDivElement>(null);

  function selectTab(next: WorkspaceTab) {
    setTab(next);
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen">
      <MarketingHeader />

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
          SeoroAI · Powered by Claude Opus · Built for professionals in
          Korea
        </div>
      </footer>
    </div>
  );
}
