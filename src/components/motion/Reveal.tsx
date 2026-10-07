"use client";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useIntensity } from "./MotionRoot";

type Kind = "fade-up" | "mask" | "blur" | "stagger" | "scale" | "none";

export function Reveal({
  kind = "fade-up",
  delay = 0,
  className,
  children,
  as = "div",
}: {
  kind?: Kind;
  delay?: number;
  className?: string;
  children: ReactNode;
  as?: "div" | "li" | "article";
}) {
  const intensity = useIntensity();
  const reduce = useReducedMotion();
  const Tag = as;
  if (kind === "none" || reduce || intensity <= 3) return <Tag className={className}>{children}</Tag>;

  const d = intensity * 4;
  const duration = 0.35 + intensity * 0.06;
  const variants: Record<Exclude<Kind, "none" | "stagger">, Variants> = {
    "fade-up": { hidden: { opacity: 0, y: d }, show: { opacity: 1, y: 0 } },
    mask: { hidden: { clipPath: "inset(0 0 100% 0)", y: d / 2 }, show: { clipPath: "inset(0 0 0% 0)", y: 0 } },
    blur: { hidden: { opacity: 0, filter: "blur(12px)" }, show: { opacity: 1, filter: "blur(0px)" } },
    scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } },
  };
  const v = kind === "stagger" ? variants["fade-up"] : variants[kind];
  const M = motion[Tag];
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={v}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  );
}

/** Contenedor que escalona a sus hijos <StaggerItem>. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const intensity = useIntensity();
  const reduce = useReducedMotion();
  if (reduce || intensity <= 3) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: Math.min(0.09, 0.5 / 6) } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const intensity = useIntensity();
  const reduce = useReducedMotion();
  if (reduce || intensity <= 3) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: intensity * 3 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
