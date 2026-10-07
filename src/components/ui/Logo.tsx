/** Marca: monograma geométrico (A formada por dos trazos y un nodo) + palabra. Original, sin recursos externos. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="var(--c-surface-2)" stroke="var(--c-border)" />
      <path d="M8.5 23.5 L16 8 L23.5 23.5" fill="none" stroke="var(--c-ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.6 17.6 H20.4" stroke="var(--c-ink)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="16" cy="8" r="3.1" fill="var(--c-accent)" />
    </svg>
  );
}

export function Logo({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[1.2rem] font-bold tracking-[0.14em] text-ink">{text}</span>
    </span>
  );
}
