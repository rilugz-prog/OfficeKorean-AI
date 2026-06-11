"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/landing/section-heading";

const FAQS = [
  {
    question: "Is SeoroAI free?",
    answer:
      "Yes. SeoroAI is completely free during our beta program — no credit card required. Beta testers also lock in early-adopter benefits for the future.",
  },
  {
    question: "Do I need to know Korean?",
    answer:
      "Not at all. SeoroAI is built for non-native speakers and learners at every level. You can write in simple Korean or even start from English, and we'll help you produce natural, professional Korean.",
  },
  {
    question: "How do I join?",
    answer:
      "Click “Start Writing Free,” create your account in under a minute, and you'll be taken straight to your dashboard to start writing.",
  },
  {
    question: "Will my feedback matter?",
    answer:
      "Absolutely. As a beta tester you get direct founder communication and priority on feature requests — your input directly shapes what we build next.",
  },
  {
    question: "Is my writing kept private?",
    answer:
      "Yes. Your text is used only to generate your results — we never sell your data, and you keep ownership of everything you create.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export function FaqSection() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know before getting started."
        />

        <div className="mx-auto mt-12 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Still have questions?{" "}
            <a
              href="mailto:hello@seoroai.com"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Email the founder directly
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
