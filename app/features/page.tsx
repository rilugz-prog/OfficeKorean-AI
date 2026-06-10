import Link from "next/link";
import type { Metadata } from "next";
import {
  Languages,
  Sparkles,
  BookOpen,
  LayoutTemplate,
  History,
  BookMarked,
  ShieldCheck,
  Gauge,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features — OfficeKorean AI",
  description:
    "Professional translation, a Korean cultural filter, message decoding, workplace templates, history, and a phrase library.",
};

const FEATURES = [
  {
    icon: Languages,
    title: "Professional Translation",
    body: "Translate between English and Korean in exactly the right workplace register — from casual coworker to executive.",
  },
  {
    icon: Sparkles,
    title: "Korean Cultural Filter",
    body: "Rewrite blunt messages into polished, hierarchy-aware Korean that fits 직장 예절 (workplace etiquette).",
  },
  {
    icon: BookOpen,
    title: "Explain Korean",
    body: "Decode what a Korean message really means — tone, urgency, hidden expectations, and a suggested reply.",
  },
  {
    icon: LayoutTemplate,
    title: "Workplace Templates",
    body: "35+ built-in templates for leave, meetings, approvals, delays, client and HR communication — generated in Korean & English.",
  },
  {
    icon: History,
    title: "Translation History",
    body: "Every translation, filter and analysis is saved, searchable, filterable and favoritable.",
  },
  {
    icon: BookMarked,
    title: "Phrase Library",
    body: "Save your go-to workplace messages by category for instant reuse.",
  },
  {
    icon: Gauge,
    title: "Usage Dashboard",
    body: "Track your usage against plan limits with clear charts and upcoming-limit warnings.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    body: "Row-level security, session validation and ownership checks keep your data private to you.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main className="container py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to work in Korean
          </h1>
          <p className="mt-3 text-muted-foreground">
            OfficeKorean AI is built for foreigners navigating Korean corporate
            communication — translation plus the cultural context that matters.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center gap-3">
          <Link href="/register">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              See pricing
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
