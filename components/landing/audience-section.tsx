import { Plane, GraduationCap, Briefcase, BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

const AUDIENCES = [
  {
    icon: Plane,
    title: "Expats in Korea",
    description:
      "Handle emails, paperwork, and daily communication without second-guessing your Korean.",
  },
  {
    icon: GraduationCap,
    title: "International Students",
    description:
      "Write assignments, professor emails, and applications in natural academic Korean.",
  },
  {
    icon: Briefcase,
    title: "Office Professionals",
    description:
      "Communicate with colleagues and clients in polished, business-appropriate Korean.",
  },
  {
    icon: BookOpen,
    title: "Korean Learners",
    description:
      "Improve faster by seeing how native speakers actually phrase things.",
  },
];

export function AudienceSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Who It's For"
            title="Made for Everyone Writing Korean as a Second Language"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((audience, index) => (
            <Reveal key={audience.title} delay={index * 80} className="h-full">
              <Card className="h-full border-border/60 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <audience.icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {audience.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
