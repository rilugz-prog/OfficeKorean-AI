import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — SeoroAI",
  description: "How SeoroAI collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        This is a placeholder privacy policy for the SeoroAI beta. Replace it
        with your finalized legal copy before public launch.
      </p>
      <div>
        <h2>Information We Collect</h2>
        <p>
          We collect the account information you provide (such as your email
          address) and the text you submit to generate Korean writing
          suggestions. We use this only to provide and improve the service.
        </p>
      </div>
      <div>
        <h2>How We Use Your Data</h2>
        <p>
          Your content is used to deliver writing assistance and to improve the
          quality of SeoroAI. We never sell your personal data.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p>
          Questions about privacy? Reach out to the SeoroAI team directly during
          the beta.
        </p>
      </div>
    </LegalPage>
  );
}
