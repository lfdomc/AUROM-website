import type { SectionData, SiteData } from "@/lib/schema";
import { Button } from "../ui/Button";
import { Reveal } from "../motion/Reveal";

type Props = { section: Extract<SectionData, { type: "cta" }>; site: SiteData };

export function Cta({ section: s, site }: Props) {
  const onAccent = s.background === "accent";
  return (
    <section id={s.id} className="section-y relative">
      <div className="container-x">
        <Reveal kind="scale">
          <div className={`relative overflow-hidden rounded-lg px-7 py-16 md:px-16 md:py-24 ${onAccent ? "bg-accent text-accent-ink" : "bg-surface text-ink"}`}>
            <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-20 -top-24 size-[30rem] opacity-[0.16]">
              {[60, 100, 140, 180].map((r) => (
                <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray={r === 140 ? "3 8" : undefined} />
              ))}
              <circle cx="200" cy="20" r="8" fill="currentColor" />
            </svg>
            <h2 className="relative max-w-[18ch] text-[clamp(2.2rem,5.4vw,4.4rem)] font-extrabold leading-[1]">{s.headline}</h2>
            {s.body && <p className={`relative mt-6 max-w-[48ch] text-lg ${onAccent ? "text-accent-ink/80" : "text-ink-muted"}`}>{s.body}</p>}
            <div className="relative mt-10 flex flex-wrap gap-3">
              <Button site={site} href={s.primary.href} label={s.primary.label} size="lg" variant={onAccent ? "inverse" : "primary"} />
              {s.secondary && <Button site={site} href={s.secondary.href} label={s.secondary.label} variant="ghost" size="lg" />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
