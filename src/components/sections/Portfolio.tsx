import { ArrowUpRightIcon, LockSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { SectionHeading, Shell } from "./Shell";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { Spotlight } from "../motion/Spotlight";

type Props = { section: Extract<SectionData, { type: "portfolio" }> };

const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Sitios reales entregados: tarjeta con barra de navegador, sector, descripción y enlace al sitio. */
export function Portfolio({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        <Reveal kind={s.motion.reveal}>
          <SectionHeading heading={s.heading} intro={s.intro} />
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-2">
          {s.items.map((it, i) => (
            <StaggerItem key={it.url}>
              <a href={it.url} target="_blank" rel="noopener" className="group block h-full rounded-lg">
                <Spotlight className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[transform,border-color] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:border-[color-mix(in_oklch,var(--c-accent)_55%,var(--c-border))]">
                  <div className="relative flex items-center gap-3 overflow-hidden border-b border-line bg-surface-2 px-4 py-3">
                    <span className="flex gap-1.5" aria-hidden>
                      {[0, 1, 2].map((k) => (
                        <span key={k} className="size-2.5 rounded-full bg-line transition-colors duration-500 group-hover:bg-accent" style={{ transitionDelay: `${k * 80}ms` }} />
                      ))}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-2 rounded-pill bg-surface px-3 py-1.5 font-mono text-[12px] text-ink-muted">
                      <LockSimpleIcon size={12} weight="bold" aria-hidden className="text-accent" />
                      <span className="truncate">{host(it.url)}</span>
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--c-accent)_22%,transparent),transparent)] opacity-0 transition-none group-hover:animate-[sweep_1.1s_ease-out] group-hover:opacity-100"
                    />
                  </div>
                  <div className="relative flex flex-1 flex-col justify-between gap-8 p-7 md:p-8">
                    <span aria-hidden className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[8rem] font-extrabold leading-none tracking-[-0.06em] text-line/60 transition-transform duration-700 group-hover:-translate-x-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <p className="text-sm font-medium text-accent-text">{it.sector}</p>
                      <h3 className="mt-2 text-[clamp(1.7rem,3vw,2.3rem)] font-bold">{it.name}</h3>
                      <p className="mt-3 max-w-[48ch] text-[1rem] leading-relaxed text-ink-muted">{it.description}</p>
                    </div>
                    <span className="relative inline-flex items-center gap-2 font-semibold text-ink">
                      Visitar sitio
                      <span className="sr-only"> de {it.name} (se abre en otra pestaña)</span>
                      <ArrowUpRightIcon size={17} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Spotlight>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Shell>
  );
}
