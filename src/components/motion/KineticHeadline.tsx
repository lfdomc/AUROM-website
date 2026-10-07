"use client";
import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";
import { useIntensity } from "./MotionRoot";

/** h1 cinético: solo transform (opacidad 1) para no retrasar el LCP. El texto completo está en aria-label y en el HTML. */
export function KineticHeadline({ text, emphasis, className, as = "h1" }: { text: string; emphasis?: string; className?: string; as?: "h1" | "p" }) {
  const reduce = useReducedMotion();
  const intensity = useIntensity();
  const words = text.split(" ");
  const emph = new Set(emphasis ? emphasis.split(" ") : []);
  const emStart = emphasis ? text.indexOf(emphasis) : -1;
  let cursor = 0;
  const Tag = as;

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const pos = text.indexOf(w, cursor);
        cursor = pos + w.length;
        const isEm = emStart >= 0 && pos >= emStart && pos < emStart + (emphasis?.length ?? 0) && emph.has(w);
        const inner = isEm ? <em className="font-[inherit] italic text-accent-text pr-[0.06em]">{w}</em> : w;
        return (
          <Fragment key={i}>
            <span aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] pr-[0.04em] -mr-[0.04em] align-bottom">
              {reduce || intensity <= 3 ? (
                <span className="inline-block">{inner}</span>
              ) : (
                <motion.span
                  className="inline-block will-change-transform"
                  initial={{ y: "108%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 0.06 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                >
                  {inner}
                </motion.span>
              )}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
