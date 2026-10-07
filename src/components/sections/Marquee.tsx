import type { SectionData } from "@/lib/schema";

type Props = { section: Extract<SectionData, { type: "marquee" }> };

export function Marquee({ section: s }: Props) {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {s.items.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="font-display text-[clamp(1.25rem,2.4vw,1.9rem)] font-semibold tracking-[-0.02em] text-ink-muted transition-colors hover:text-ink">
            {t}
          </span>
          <span aria-hidden className="mx-8 inline-block size-2 rotate-45 bg-accent/70" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={s.label} className="border-y border-line bg-surface py-8">
      {s.label && <h2 className="container-x mb-5 font-sans text-sm font-semibold tracking-normal text-ink">{s.label}</h2>}
      <div className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee-track flex w-max">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
