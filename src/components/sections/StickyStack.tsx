import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { SectionHeading, Shell } from "./Shell";
import { Reveal } from "../motion/Reveal";
import { SolutionVisual } from "../visuals/SolutionVisual";
import { StackScaler } from "./StackScaler";

type Props = { section: Extract<SectionData, { type: "stickyStack" }> };

export function StickyStack({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        <Reveal kind={s.motion.reveal}>
          <SectionHeading heading={s.heading} intro={s.intro} />
        </Reveal>
        <StackScaler>
          <ol className="mt-14 space-y-6 md:mt-20 md:space-y-10">
            {s.items.map((it, i) => (
              <li key={it.title} className="stack-card md:sticky" style={{ top: `calc(6.25rem + ${i * 22}px)`, zIndex: i + 1 }}>
                <div className="stack-inner origin-top will-change-transform">
                <Reveal kind="fade-up" as="article" className="grid gap-8 rounded-lg border border-line bg-surface p-6 shadow-[0_-18px_40px_-28px_color-mix(in_oklch,var(--c-bg)_90%,black)] transition-colors duration-500 hover:border-[color-mix(in_oklch,var(--c-accent)_45%,var(--c-border))] md:grid-cols-12 md:p-10 lg:gap-12">
                  <div className="md:col-span-7">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs tabular-nums text-ink-muted">{String(i + 1).padStart(2, "0")}/{String(s.items.length).padStart(2, "0")}</span>
                      <span className="rounded-pill border border-line px-3 py-1 text-[0.8rem] font-medium text-ink-muted">{it.tag}</span>
                    </div>
                    <h3 className="mt-5 text-[clamp(1.75rem,3.2vw,2.6rem)] font-bold">
                      <Link href={it.href} className="transition-colors hover:text-accent-text">{it.title}</Link>
                    </h3>
                    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-semibold text-ink-muted">El problema</dt>
                        <dd className="mt-1.5 text-[0.98rem] leading-relaxed text-ink-muted">{it.problem}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-accent-text">La solución</dt>
                        <dd className="mt-1.5 text-[0.98rem] leading-relaxed text-ink">{it.result}</dd>
                      </div>
                    </dl>
                    <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                      {it.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-[0.95rem] text-ink">
                          <CheckIcon size={16} weight="bold" className="mt-1 shrink-0 text-accent" aria-hidden />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={it.href}
                      className="group mt-8 inline-flex items-center gap-2 font-semibold text-ink underline decoration-line decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent"
                    >
                      Ver la solución
                      <span className="sr-only">: {it.title}</span>
                      <ArrowRightIcon size={16} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className={`md:col-span-5 md:self-center ${i % 2 === 1 ? "md:order-first" : ""}`}>
                    <Reveal kind="scale" delay={0.15}>
                      <SolutionVisual name={it.visual} />
                    </Reveal>
                  </div>
                </Reveal>
                </div>
              </li>
            ))}
          </ol>
        </StackScaler>
      </div>
    </Shell>
  );
}
