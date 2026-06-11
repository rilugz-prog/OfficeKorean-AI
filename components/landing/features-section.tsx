import {
  Mail,
  SlidersHorizontal,
  SpellCheck,
  MessageSquareQuote,
  FileText,
  GraduationCap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/section-heading";

const FEATURES = [
  {
    icon: Mail,
    title: "Professional Email Writer",
    description:
      "Generate clear, polite, and professional Korean emails for any workplace situation.",
  },
  {
    icon: SlidersHorizontal,
    title: "Tone Converter",
    description:
      "Switch instantly between casual, polite, and formal business Korean.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Enhancement",
    description:
      "Catch grammar mistakes and fix awkward phrasing automatically.",
  },
  {
    icon: MessageSquareQuote,
    title: "Natural Korean Expressions",
    description:
      "Replace stiff translations with expressions native speakers actually use.",
  },
  {
    icon: FileText,
    title: "Document Assistant",
    description:
      "Draft reports, notices, and workplace documents with confidence.",
  },
  {
    icon: GraduationCap,
    title: "Korean Learning Support",
    description:
      "Understand why each suggestion works so your Korean keeps improving.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Features"
          title="Everything You Need to Write Better Korean"
          description="A complete toolkit for natural, professional Korean communication."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
