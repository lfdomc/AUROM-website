import type { SectionData } from "@/lib/schema";
import { SectionHeading, Shell } from "./Shell";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { Spotlight } from "../motion/Spotlight";
import { Icon } from "../ui/Icon";
import { Ambient } from "../motion/Ambient";

type Props = { section: Extract<SectionData, { type: "features" }> };

/** Encabezado fijo a la izquierda; a la derecha bloques con foco que sigue al puntero e icono animado. */
export function Features({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background === "base" ? "surface" : s.background}>
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <Reveal kind={s.motion.reveal} className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading heading={s.heading} intro={s.intro} />
          </div>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {s.items.map((it, i) => (
            <StaggerItem key={it.title} className="h-full">
              <Spotlight className="group h-full rounded-lg border border-line bg-bg p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklch,var(--c-accent)_50%,var(--c-border))]">
                <Ambient icon={it.icon} className="text-accent" />
                <span className="relative grid size-14 place-items-center rounded-sm bg-surface">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-sm border border-accent/40 animate-[soft-pulse_3.2s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  <Icon name={it.icon} size={28} className="text-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                </span>
                <h3 className="relative mt-6 text-2xl font-bold">{it.title}</h3>
                <p className="relative mt-3 text-[1.02rem] leading-relaxed text-ink-muted">{it.body}</p>
              </Spotlight>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Shell>
  );
}
