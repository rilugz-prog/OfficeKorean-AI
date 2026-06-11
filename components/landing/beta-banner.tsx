export function BetaBanner() {
  return (
    <section aria-label="Beta availability" className="border-b bg-muted/30">
      <div className="container flex items-center justify-center gap-2.5 py-4 text-center text-sm font-medium text-foreground">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        Currently accepting founding beta testers
      </div>
    </section>
  );
}
