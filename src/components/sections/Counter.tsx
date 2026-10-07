"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** El servidor ya pinta el valor final (SEO y sin JS). El cliente solo anima el conteo. */
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const c = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (n) => (el.textContent = Math.round(n).toLocaleString("es-CR")) });
    return () => c.stop();
  }, [inView, reduce, value]);
  return <span ref={ref}>{value.toLocaleString("es-CR")}</span>;
}
