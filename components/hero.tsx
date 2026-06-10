import { Globe } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-grid-radial pointer-events-none absolute inset-0 opacity-70" />
      <div className="container relative flex flex-col items-center py-16 text-center sm:py-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
          <Globe className="h-4 w-4 text-primary" />
          For foreigners working in Korea
        </div>
        <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          SeoroAI
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Translate Language. Understand Workplace Culture.
        </p>
      </div>
    </section>
  );
}
