import Link from "next/link";
import { PenLine } from "lucide-react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container flex flex-col items-center gap-6 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PenLine className="h-4 w-4" />
            </span>
            <span>
              Seoro<span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            AI Korean Writing Assistant
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © 2026 SeoroAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
