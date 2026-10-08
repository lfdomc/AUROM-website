import { Fragment, type CSSProperties } from "react";

/**
 * Titular cinético con animación CSS: arranca en el primer pintado, sin esperar a que cargue JavaScript
 * (mejor LCP en celulares). Solo usa transform. El texto completo queda en el HTML para Google y lectores de pantalla.
 */
export function KineticHeadline({ text, emphasis, className, as = "h1" }: { text: string; emphasis?: string; className?: string; as?: "h1" | "p" }) {
  const words = text.split(" ");
  const emph = new Set(emphasis ? emphasis.split(" ") : []);
  const emStart = emphasis ? text.indexOf(emphasis) : -1;
  let cursor = 0;
  const Tag = as;

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const pos = text.indexOf(w, cursor);
        cursor = pos + w.length;
        const isEm = emStart >= 0 && pos >= emStart && pos < emStart + (emphasis?.length ?? 0) && emph.has(w);
        const inner = isEm ? <em className="font-[inherit] italic text-accent-text pr-[0.06em]">{w}</em> : w;
        return (
          <Fragment key={i}>
            <span aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] pr-[0.04em] -mr-[0.04em] align-bottom">
              <span className="kw" style={{ "--d": `${(0.04 + i * 0.05).toFixed(2)}s` } as CSSProperties}>
                {inner}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
