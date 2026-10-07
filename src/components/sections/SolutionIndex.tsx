"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData, SiteData } from "@/lib/schema";
import { Icon } from "../ui/Icon";

type Props = { section: Extract<SectionData, { type: "solutionIndex" }>; site: SiteData };

const EASE = [0.16, 1, 0.3, 1] as const;

/** Índice de soluciones: lista vertical, fácil de leer, que entra en cascada y lleva a cada página. */
export function SolutionIndex({ section: s, site }: Props) {
  const reduce = useReducedMotion();
  const rows = s.items
    .map((it) => ({ ...it, page: site.pages.find((p) => p.slug === it.slug)! }))
    .filter((r) => r.page);

  return (
    <section id={s.id} className="section-y relative bg-bg !pt-4">
      <div className="container-x">
        <div className="max-w-3xl">
          <h2 className="text-[clamp(1.8rem,3.6vw,2.8rem)] font-bold">{s.heading}</h2>
          {s.intro && <p className="mt-4 max-w-[60ch] text-lg text-ink-muted">{s.intro}</p>}
        </div>

        <ol className="mt-12 border-b border-line">
          {rows.map((r, i) => (
            <motion.li
              key={r.slug}
              className="relative"
              initial={reduce ? false : { opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: Math.min(i, 3) * 0.06, ease: EASE }}
            >
              {/* filete superior que se dibuja al aparecer */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: EASE }}
              />
              <Link
                href={`/${r.slug}`}
                className="group relative grid grid-cols-[auto_1fr_auto] items-start md:items-center gap-x-5 gap-y-3 rounded-sm px-2 py-7 transition-colors duration-300 hover:bg-surface md:grid-cols-[3rem_auto_1fr_auto_auto] md:gap-x-8 md:px-5"
              >
                <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] origin-center scale-y-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                <span className="hidden font-mono text-sm tabular-nums text-ink-muted md:block">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative grid size-12 place-items-center rounded-sm bg-surface transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-ink">
                  <span aria-hidden className="absolute inset-0 rounded-sm border border-accent/40 animate-[soft-pulse_3.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.35}s` }} />
                  <Icon name={r.icon} size={24} className="text-accent transition-colors duration-300 group-hover:text-accent-ink" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-accent-text">
                    {r.page.navLabel ?? r.page.seo.title}
                  </span>
                  <span className="mt-1.5 block max-w-[68ch] text-[0.98rem] leading-relaxed text-ink-muted">{r.page.seo.description}</span>
                </span>
                <span className="col-span-2 col-start-2 w-fit rounded-pill border border-line px-3 py-1 text-[0.8rem] font-medium text-ink-muted md:col-span-1 md:col-start-auto">
                  {r.tag}
                </span>
                <span className="row-start-1 col-start-3 grid size-11 place-items-center rounded-full border border-line transition-[background-color,border-color,transform] duration-300 group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink md:col-start-auto md:row-start-auto">
                  <ArrowRightIcon size={18} weight="bold" aria-hidden />
                </span>
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
