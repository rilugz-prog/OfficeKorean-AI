"use client";

import * as React from "react";

import { PageHeader } from "@/components/page-header";
import { Workspace, WorkspaceTab } from "@/components/workspace";

export default function TranslatePage() {
  const [tab, setTab] = React.useState<WorkspaceTab>("translate");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Translate"
        description="Translate, refine tone, and decode Korean — all in one workspace."
      />
      <Workspace value={tab} onValueChange={setTab} />
    </div>
  );
}
