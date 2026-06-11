import { Quote } from "lucide-react";

export function FounderSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            {/* Founder avatar */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary sm:mx-0">
              SR
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Meet SeoroAI
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why I Built SeoroAI
              </h2>
            </div>
          </div>

          <figure className="relative mt-10 rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
            <Quote
              className="absolute -top-4 left-8 h-10 w-10 text-primary/20"
              aria-hidden="true"
            />
            <blockquote className="text-lg leading-relaxed text-foreground/90">
              After living and working in Korea for over a decade, I saw
              firsthand how difficult it can be for non-native speakers to write
              professional Korean with confidence. Whether it&apos;s a workplace
              email, report, or client communication, many talented
              professionals struggle to express themselves naturally in Korean.
              SeoroAI was built to help bridge that gap.
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                The Founder
              </span>
              <span aria-hidden="true">·</span>
              SeoroAI
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
