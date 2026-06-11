import { Mail, Languages, SpellCheck, Bot } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/section-heading";

const PROBLEMS = [
  {
    icon: Mail,
    title: "Business Emails",
    description: "Unsure how to write professional Korean emails.",
  },
  {
    icon: Languages,
    title: "Formal Korean",
    description: "Difficulty using proper business language.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Issues",
    description: "Constantly checking grammar and phrasing.",
  },
  {
    icon: Bot,
    title: "Translation Problems",
    description: "Machine translations often sound unnatural.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The Problem"
          title="Writing Korean Shouldn't Be This Stressful"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((problem) => (
            <Card
              key={problem.title}
              className="border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <problem.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
