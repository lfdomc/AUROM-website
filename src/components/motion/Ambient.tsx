"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { IconName } from "@/lib/schema";

/**
 * Fondo animado alusivo al tema de cada bloque (se elige por el ícono).
 * Sutil en reposo; se intensifica al pasar el mouse (group-hover) y aparece al hacer scroll.
 * Usa currentColor: en bloques oscuros toma el dorado, en bloques de color toma la tinta del bloque.
 */
export function Ambient({ icon, className = "" }: { icon: IconName; className?: string }) {
  const reduce = useReducedMotion();
  const Art = ART[icon] ?? Glow;
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ambient absolute inset-0 opacity-[0.18] transition-opacity duration-[1200ms] ease-out group-hover:opacity-[0.3]">
        <Art />
      </div>
    </motion.div>
  );
}

/* Cada arte vive en la esquina inferior derecha y no tapa el texto. */
const box = "absolute -bottom-6 -right-6 h-[62%] w-[50%] max-w-[20rem]";

function Sparkles() {
  const pts = [
    [70, 22, 1], [86, 48, 0.7], [52, 60, 0.55], [78, 78, 0.9], [92, 16, 0.5], [60, 34, 0.45],
  ];
  return (
    <svg className={box} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet">
      {pts.map(([x, y, s], i) => (
        <path
          key={i}
          className="amb-twinkle"
          style={{ animationDelay: `${i * 1.2}s`, transformOrigin: `${x}px ${y}px` }}
          d={`M${x} ${y - 8 * s} C${x + 1.2 * s} ${y - 1.2 * s} ${x + 1.2 * s} ${y - 1.2 * s} ${x + 8 * s} ${y} C${x + 1.2 * s} ${y + 1.2 * s} ${x + 1.2 * s} ${y + 1.2 * s} ${x} ${y + 8 * s} C${x - 1.2 * s} ${y + 1.2 * s} ${x - 1.2 * s} ${y + 1.2 * s} ${x - 8 * s} ${y} C${x - 1.2 * s} ${y - 1.2 * s} ${x - 1.2 * s} ${y - 1.2 * s} ${x} ${y - 8 * s} Z`}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function Lens() {
  return (
    <div className="absolute inset-0">
      <span className="amb-lens absolute size-40 rounded-full border-[3px] border-current" style={{ boxShadow: "0 0 60px 10px currentColor inset" }} />
    </div>
  );
}

function Ripples() {
  return (
    <div className="absolute -bottom-16 -right-16 size-64">
      {[0, 1, 2].map((i) => (
        <span key={i} className="amb-ripple absolute inset-0 rounded-full border-2 border-current" style={{ animationDelay: `${i * 3}s` }} />
      ))}
      <span className="absolute inset-[38%] rounded-full bg-current blur-xl" />
    </div>
  );
}

function Bars() {
  return (
    <div className={`${box} flex items-end gap-2 pb-6 pr-8`}>
      {[40, 65, 50, 80, 60, 95].map((h, i) => (
        <span key={i} className="amb-bar flex-1 origin-bottom rounded-t-[4px] bg-current" style={{ height: `${h}%`, animationDelay: `${i * 0.9}s` }} />
      ))}
    </div>
  );
}

function OrbitDots() {
  return (
    <div className="absolute -bottom-10 -right-10 size-56">
      <span className="absolute inset-0 rounded-full border border-dashed border-current" />
      <span className="absolute inset-[22%] rounded-full border border-current" />
      <span className="amb-spin absolute inset-0">
        <span className="absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </span>
      <span className="amb-spin-rev absolute inset-[22%]">
        <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </span>
    </div>
  );
}

function CodeLines() {
  const w = [70, 45, 85, 30, 60, 75, 40, 90, 55, 35, 80, 50];
  return (
    <div className={`${box} overflow-hidden pr-6`}>
      <div className="amb-scroll space-y-2.5">
        {[...w, ...w].map((x, i) => (
          <span key={i} className="block h-2 rounded-full bg-current" style={{ width: `${x}%`, marginLeft: `${(i % 4) * 8}%` }} />
        ))}
      </div>
    </div>
  );
}

function Layers() {
  return (
    <div className="absolute -bottom-4 -right-4 size-56">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="amb-layer absolute inset-x-6 h-20 rounded-lg border-2 border-current"
          style={{ bottom: `${12 + i * 22}%`, animationDelay: `${i * 1.5}s`, transform: "skewX(-12deg)" }}
        />
      ))}
    </div>
  );
}

function Wires() {
  return (
    <svg className={box} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet">
      <path d="M8 80 C 40 80, 40 30, 72 30" fill="none" stroke="currentColor" strokeWidth="2" className="amb-dash" />
      <path d="M8 55 C 45 55, 50 75, 88 75" fill="none" stroke="currentColor" strokeWidth="2" className="amb-dash" style={{ animationDelay: "-0.8s" }} />
      {[[8, 80], [72, 30], [8, 55], [88, 75]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="currentColor" className="amb-node" style={{ animationDelay: `${i * 1.6}s`, transformOrigin: `${x}px ${y}px` }} />
      ))}
    </svg>
  );
}

function Globe() {
  return (
    <div className="absolute -bottom-12 -right-12 size-60 rounded-full border-2 border-current">
      {[0, 1, 2].map((i) => (
        <span key={i} className="amb-meridian absolute inset-0 rounded-full border-2 border-current" style={{ animationDelay: `${i * -6}s` }} />
      ))}
      <span className="absolute inset-x-0 top-1/2 h-0.5 bg-current" />
      <span className="absolute inset-x-[8%] top-[28%] h-0.5 bg-current opacity-60" />
      <span className="absolute inset-x-[8%] top-[72%] h-0.5 bg-current opacity-60" />
    </div>
  );
}

function FlowPath() {
  return (
    <svg className={box} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet">
      <path d="M5 85 C 30 85, 30 50, 55 50 S 80 15, 96 15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" className="amb-dash" />
      <circle r="4.5" fill="currentColor">
        <animateMotion dur="12s" repeatCount="indefinite" path="M5 85 C 30 85, 30 50, 55 50 S 80 15, 96 15" />
      </circle>
    </svg>
  );
}

function Clock() {
  return (
    <div className="absolute -bottom-10 -right-10 size-52 rounded-full border-2 border-current">
      <span className="amb-spin absolute inset-0" style={{ animationDuration: "40s" }}>
        <span className="absolute bottom-1/2 left-1/2 h-[42%] w-0.5 -translate-x-1/2 rounded-full bg-current" />
      </span>
      <span className="amb-spin absolute inset-0" style={{ animationDuration: "240s" }}>
        <span className="absolute bottom-1/2 left-1/2 h-[28%] w-1 -translate-x-1/2 rounded-full bg-current" />
      </span>
    </div>
  );
}

function Shield() {
  return (
    <div className="absolute -bottom-8 -right-6 h-56 w-48">
      <svg viewBox="0 0 100 120" className="size-full">
        <path d="M50 6 L90 22 V58 C90 86 70 104 50 114 C30 104 10 86 10 58 V22 Z" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <span className="amb-scan absolute inset-x-4 h-1 rounded-full bg-current blur-[2px]" />
    </div>
  );
}

function Bolt() {
  return (
    <svg className={`${box} amb-flicker`} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet">
      <path d="M58 6 L24 58 H48 L40 96 L78 40 H54 Z" fill="currentColor" />
    </svg>
  );
}

function Grid() {
  return (
    <div className={`${box} grid grid-cols-4 gap-2 p-6`}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="amb-cell rounded-[4px] bg-current" style={{ animationDelay: `${(i * 1.1) % 7}s` }} />
      ))}
    </div>
  );
}

function Glow() {
  return <span className="amb-glow absolute -bottom-20 -right-20 size-72 rounded-full bg-current blur-3xl" />;
}

const ART: Partial<Record<IconName, () => ReactNode>> = {
  spark: Sparkles,
  magnifier: Lens,
  heart: Ripples,
  chart: Bars,
  gauge: Bars,
  users: OrbitDots,
  code: CodeLines,
  stack: Layers,
  plugs: Wires,
  globe: Globe,
  map: Globe,
  flow: FlowPath,
  clock: Clock,
  shield: Shield,
  lock: Shield,
  lightning: Bolt,
  calculator: Grid,
  target: Ripples,
  wrench: Layers,
  envelope: FlowPath,
  file: CodeLines,
  robot: OrbitDots,
  whatsapp: Ripples,
  house: Layers,
  bell: Ripples,
  chat: OrbitDots,
};
