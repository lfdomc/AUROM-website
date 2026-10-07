"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Efecto "roller": la fijación es CSS (sticky). GSAP solo reduce un poco la escala de la tarjeta
 * anterior mientras llega la siguiente. Sin oscurecer: la anterior sigue visible y legible.
 */
export function StackScaler({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let revert = () => {};
    let alive = true;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!alive || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".stack-card", ref.current);
        cards.forEach((c, i) => {
          const next = cards[i + 1];
          const inner = c.querySelector<HTMLElement>(".stack-inner");
          if (!next || !inner) return;
          gsap.to(inner, {
            scale: 0.965,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 25%", scrub: true },
          });
        });
      });
      revert = () => mm.revert();
    })();
    return () => {
      alive = false;
      revert();
    };
  }, []);
  return <div ref={ref}>{children}</div>;
}
