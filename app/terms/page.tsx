import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — SeoroAI",
  description: "The terms that govern your use of SeoroAI.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <p>
        This is a placeholder terms-of-service document for the SeoroAI beta.
        Replace it with your finalized legal copy before public launch.
      </p>
      <div>
        <h2>Beta Service</h2>
        <p>
          SeoroAI is provided free of charge during the beta period and is
          offered &ldquo;as is&rdquo; while we actively develop the product.
          Features may change as we incorporate tester feedback.
        </p>
      </div>
      <div>
        <h2>Acceptable Use</h2>
        <p>
          You agree to use SeoroAI lawfully and not to misuse the service. You
          retain ownership of the content you create.
        </p>
      </div>
      <div>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach out to the SeoroAI team directly
          during the beta.
        </p>
      </div>
    </LegalPage>
  );
}
