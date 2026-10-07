import type { ReactNode } from "react";

const bg = {
  base: "bg-bg text-ink",
  surface: "bg-surface text-ink",
  accent: "bg-accent text-accent-ink",
  inverse: "bg-ink text-bg",
} as const;

export function Shell({
  id,
  background = "base",
  className = "",
  pad = true,
  children,
  label,
}: {
  id?: string;
  background?: keyof typeof bg;
  className?: string;
  pad?: boolean;
  children: ReactNode;
  label?: string;
}) {
  return (
    <section id={id} aria-label={label} className={`relative ${bg[background]} ${pad ? "section-y" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ heading, intro, className = "" }: { heading: string; intro?: string; className?: string }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-bold">{heading}</h2>
      {intro && <p className="mt-5 max-w-[60ch] text-lg text-ink-muted">{intro}</p>}
    </div>
  );
}
