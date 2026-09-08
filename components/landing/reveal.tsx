"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useInView } from "@/components/landing/use-in-view";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in ms, for revealing siblings in sequence. */
  delay?: number;
}

/**
 * Reveals its children with a subtle fade-and-rise once they scroll into view.
 *
 * Kept as a leaf client component so the sections that use it can stay Server
 * Components. Users with `prefers-reduced-motion` get the content immediately
 * with no transition; see the `.reveal` rules in globals.css.
 */
export function Reveal({ className, delay = 0, children, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const shown = useInView(ref);

  return (
    <div
      ref={ref}
      data-shown={shown}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
