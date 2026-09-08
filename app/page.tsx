import type { Metadata } from "next";

import { SiteNav } from "@/components/landing/site-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { BetaBanner } from "@/components/landing/beta-banner";
import { MobileCtaBar } from "@/components/landing/mobile-cta-bar";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { AudienceSection } from "@/components/landing/audience-section";
import { FounderSection } from "@/components/landing/founder-section";
import { BetaSection } from "@/components/landing/beta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = {
  title: "SeoroAI — Write Professional Korean With Confidence",
  description:
    "SeoroAI is an AI-powered Korean writing assistant for expats, students, and professionals. Create natural, professional Korean emails, reports, and workplace documents in minutes.",
  keywords: [
    "Korean writing assistant",
    "AI Korean email",
    "professional Korean",
    "Korean for expats",
    "Korean grammar checker",
    "business Korean",
  ],
  openGraph: {
    title: "SeoroAI — Write Professional Korean With Confidence",
    description:
      "Your AI-powered Korean writing assistant. Natural, professional Korean emails and documents in minutes.",
    type: "website",
    siteName: "SeoroAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SeoroAI — Write Professional Korean With Confidence",
    description:
      "Your AI-powered Korean writing assistant. Natural, professional Korean emails and documents in minutes.",
  },
};

export default function HomePage() {
  return (
    <div className="editorial flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteNav />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <BetaBanner />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <BeforeAfterSection />
        <AudienceSection />
        <FounderSection />
        <BetaSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  );
}
