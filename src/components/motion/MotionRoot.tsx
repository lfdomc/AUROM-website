"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

const IntensityCtx = createContext(5);
export const useIntensity = () => useContext(IntensityCtx);

export function MotionRoot({
  intensity,
  smoothScroll,
  scrollProgress,
  children,
}: {
  intensity: number;
  smoothScroll: boolean;
  scrollProgress: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!smoothScroll || reduce || intensity < 6) return;
    let lenis: { destroy: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      const l = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -88 } });
      lenis = l;
      // ScrollTrigger (si se carga) se sincroniza con Lenis
      const w = window as unknown as { __lenis?: typeof l };
      w.__lenis = l;
    })();
    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, [smoothScroll, reduce, intensity]);

  return (
    <IntensityCtx.Provider value={intensity}>
      {scrollProgress && !reduce && <ProgressBar />}
      {children}
    </IntensityCtx.Provider>
  );
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] bg-accent"
    />
  );
}
