"use client";

import * as React from "react";

/**
 * Latches to `true` the first time `ref` enters the viewport.
 *
 * Callers use this to drive reveal animations, where the pre-reveal state is
 * invisible — so never firing would hide content permanently. Three independent
 * triggers guard against that: an immediate check for elements already on
 * screen, an IntersectionObserver, and a passive scroll listener that still
 * works in environments where IntersectionObserver silently never fires.
 *
 * Returns `true` immediately when the user prefers reduced motion.
 */
export function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let settled = false;
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    }

    const show = () => {
      if (settled) return;
      settled = true;
      cleanup();
      setInView(true);
    };

    const isOnScreen = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewportHeight * 0.92 && rect.bottom > 0;
    };

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (isOnScreen()) show();
      });
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || isOnScreen()) {
      show();
      return cleanup;
    }

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) show();
        },
        { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
      );
      observer.observe(el);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return cleanup;
  }, [ref]);

  return inView;
}
