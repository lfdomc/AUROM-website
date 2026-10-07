import type { SectionData } from "@/lib/schema";
import { Shell } from "./Shell";
import { Reveal } from "../motion/Reveal";
import { Counter } from "./Counter";

type Props = { section: Extract<SectionData, { type: "stats" }> };

export function Stats({ section: s }: Props) {
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        {s.heading && (
          <Reveal kind={s.motion.reveal}>
            <h2 className="max-w-2xl text-[clamp(1.9rem,4vw,3rem)] font-bold">{s.heading}</h2>
          </Reveal>
        )}
        <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {s.items.map((it) => (
            <div key={it.label} className="flex flex-col-reverse justify-end gap-4 bg-bg p-8 md:p-10">
              <dt className="max-w-[28ch] text-[1.02rem] leading-snug text-ink-muted">{it.label}</dt>
              <dd className="font-display text-[clamp(4rem,9vw,7.5rem)] font-extrabold leading-[0.85] tracking-[-0.05em] text-ink tabular-nums">
                {it.prefix}
                <Counter value={it.value} />
                {it.suffix && <span className="text-accent-text">{it.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
        {s.note && <p className="mt-4 text-sm text-ink-muted">{s.note}</p>}
      </div>
    </Shell>
  );
}
