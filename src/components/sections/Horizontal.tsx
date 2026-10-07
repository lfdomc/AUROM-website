"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { SectionData } from "@/lib/schema";
import { SectionHeading } from "./Shell";
import { Reveal } from "../motion/Reveal";

type Props = { section: Extract<SectionData, { type: "horizontal" }> };
type Step = Props["section"]["steps"][number];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Proceso por etapas en cuadrícula: las primeras quedan arriba y las siguientes bajan a la próxima fila
 * cuando ya no caben. Cada etapa se revela al llegar con el scroll, se enciende su número y se dibuja su línea.
 */
export function Horizontal({ section: s }: Props) {
  return (
    <section id={s.id} className="section-y relative overflow-hidden bg-bg">
      <div className="container-x">
        <Reveal kind={s.motion.reveal}>
          <SectionHeading heading={s.heading} intro={s.intro} />
        </Reveal>
        <ol className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
          {s.steps.map((st, i) => (
            <StepCard key={st.title} step={st} index={i} total={s.steps.length} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.45 });
  const on = reduce || seen;
  const col = index % 3; // escalona por columna para que la fila se arme de izquierda a derecha
  const last = index === total - 1;

  return (
    <motion.li
      ref={ref}
      className="relative"
      initial={reduce ? false : { opacity: 0, y: 36 }}
      animate={on ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, delay: col * 0.14, ease: EASE }}
    >
      <div className="flex items-center gap-4">
        <motion.span
          className="grid size-12 shrink-0 place-items-center rounded-full border-2 font-display text-lg font-bold"
          initial={false}
          animate={{
            backgroundColor: on ? "var(--c-accent)" : "rgba(0,0,0,0)",
            borderColor: on ? "var(--c-accent)" : "var(--c-border)",
            color: on ? "var(--c-accent-ink)" : "var(--c-ink-muted)",
          }}
          transition={{ duration: 0.5, delay: col * 0.14 + 0.25 }}
        >
          {index + 1}
        </motion.span>
        <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <motion.span
            className="absolute inset-0 origin-left bg-accent"
            initial={reduce ? false : { scaleX: 0 }}
            animate={on ? { scaleX: last ? 0.35 : 1 } : undefined}
            transition={{ duration: 0.9, delay: col * 0.14 + 0.35, ease: EASE }}
          />
        </span>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-surface p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklch,var(--c-accent)_50%,var(--c-border))] md:p-8">
        <p className="text-xs font-medium tabular-nums text-ink-muted">
          Etapa {index + 1} de {total}
        </p>
        <h3 className="mt-2 text-[clamp(1.5rem,2.4vw,2rem)] font-bold">{step.title}</h3>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-muted">{step.body}</p>
        {step.detail && <p className="mt-6 border-t border-line pt-4 text-sm font-medium text-ink">{step.detail}</p>}
      </div>
    </motion.li>
  );
}
