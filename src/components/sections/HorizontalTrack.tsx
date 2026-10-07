"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Escritorio: pin + scrub horizontal con GSAP. Móvil, sin JS o con movimiento reducido: carrusel con scroll-snap. */
export function HorizontalTrack({ header, children }: { header: ReactNode; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revert = () => {};
    let alive = true;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!alive || !wrap.current || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const t = track.current!;
        t.style.overflowX = "visible";
        const dist = () => Math.max(0, t.scrollWidth - window.innerWidth + 80);
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => bar.current && (bar.current.style.transform = `scaleX(${self.progress})`),
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          t.style.overflowX = "";
          t.style.transform = "";
        };
      });
      revert = () => mm.revert();
    })();
    return () => {
      alive = false;
      revert();
    };
  }, []);

  return (
    <div ref={wrap} className="flex flex-col lg:min-h-[100dvh] justify-center gap-12 pb-[var(--section-y-mobile)] lg:gap-16 lg:pb-16">
      {header}
      <ol
        ref={track}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:none] md:px-10 lg:gap-8 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]"
      >
        {children}
        <li aria-hidden className="w-1 shrink-0" />
      </ol>
      <div className="container-x hidden lg:block" aria-hidden>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-line">
          <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
