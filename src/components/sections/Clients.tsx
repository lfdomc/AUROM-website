import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { IconName, SectionData } from "@/lib/schema";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { Spotlight } from "../motion/Spotlight";
import { Ambient } from "../motion/Ambient";
import { Icon } from "../ui/Icon";
import { Counter } from "./Counter";

type Props = { section: Extract<SectionData, { type: "clients" }> };

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const iconFor = (group: string): IconName =>
  /planilla|odoo/i.test(group) ? "users" : /web|sitio/i.test(group) ? "globe" : /bot|asistente/i.test(group) ? "robot" : /manten/i.test(group) ? "wrench" : "spark";

/**
 * Clientes agrupados por el servicio que usan: cada grupo es un bloque con su fondo animado,
 * y los clientes con sitio web enlazan a su sitio real. "compact" es la versión discreta.
 */
export function Clients({ section: s }: Props) {
  const compact = s.variant === "compact";
  const groups = new Map<string, typeof s.items>();
  for (const c of s.items) {
    const g = c.detail ?? "Clientes";
    groups.set(g, [...(groups.get(g) ?? []), c]);
  }

  return (
    <section id={s.id} aria-label={s.heading} className={`relative border-t border-line bg-bg ${compact ? "py-16 md:py-20" : "section-y"}`}>
      <div className="container-x">
        <Reveal kind={s.motion.reveal} className="flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${compact ? "text-[clamp(1.5rem,2.6vw,2rem)]" : "text-[clamp(1.9rem,3.6vw,2.8rem)]"} max-w-[22ch] font-bold`}>{s.heading}</h2>
          {s.highlight && (
            <p className="flex items-baseline gap-3">
              <span className="font-display text-[clamp(2.6rem,5vw,3.8rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-text tabular-nums">
                <Counter value={s.highlight.value} />
              </span>
              <span className="max-w-[24ch] text-[0.95rem] leading-snug text-ink-muted">{s.highlight.label}</span>
            </p>
          )}
        </Reveal>

        <div className={`mt-10 grid gap-4 ${groups.size > 1 ? "md:grid-cols-2" : ""}`}>
          {[...groups.entries()].map(([group, items]) => (
            <Reveal key={group} kind="fade-up">
              <Spotlight className="group relative h-full overflow-hidden rounded-lg border border-line bg-surface">
                <Ambient icon={iconFor(group)} className="text-accent" />
                <div className="relative flex items-center gap-3 border-b border-line px-6 py-4">
                  <span className="grid size-10 place-items-center rounded-sm bg-bg text-accent">
                    <Icon name={iconFor(group)} size={20} />
                  </span>
                  <span className="font-semibold text-ink">{group}</span>
                  <span className="ml-auto rounded-pill border border-line px-2.5 py-0.5 text-xs tabular-nums text-ink-muted">
                    {items.length} {items.length === 1 ? "empresa" : "empresas"}
                  </span>
                </div>
                <Stagger className="relative divide-y divide-line">
                  {items.map((c) => {
                    const row = (
                      <>
                        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-bg font-display text-sm font-bold text-accent-text transition-colors duration-300 group-hover/row:border-accent">
                          {c.name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-display text-[1.15rem] font-bold tracking-[-0.01em] text-ink">{c.name}</span>
                        {c.url && (
                          <span className="flex shrink-0 items-center gap-1 text-sm text-ink-muted transition-colors group-hover/row:text-accent-text">
                            <span className="hidden sm:inline">{host(c.url)}</span>
                            <ArrowUpRightIcon size={15} weight="bold" aria-hidden className="transition-transform group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5" />
                          </span>
                        )}
                      </>
                    );
                    return (
                      <StaggerItem key={c.name}>
                        {c.url ? (
                          <a href={c.url} target="_blank" rel="noopener" className="group/row flex items-center gap-4 px-6 py-4 transition-colors duration-300 hover:bg-[color-mix(in_oklch,var(--c-accent)_7%,transparent)]">
                            {row}
                            <span className="sr-only"> (abre su sitio web)</span>
                          </a>
                        ) : (
                          <div className="group/row flex items-center gap-4 px-6 py-4">{row}</div>
                        )}
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </Spotlight>
            </Reveal>
          ))}
        </div>
        {s.more && <p className="mt-4 text-[0.95rem] text-ink-muted">{s.more}</p>}
      </div>
    </section>
  );
}
