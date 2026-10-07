import type { DesignData } from "./schema";

type Palette = DesignData["theme"]["colors"]["dark"];

const vars = (p: Palette) =>
  [
    `--c-bg:${p.bg}`,
    `--c-surface:${p.surface}`,
    `--c-surface-2:${p.surface2}`,
    `--c-ink:${p.ink}`,
    `--c-ink-muted:${p.inkMuted}`,
    `--c-accent:${p.accent}`,
    `--c-accent-ink:${p.accentInk}`,
    `--c-accent-text:${p.accentText}`,
    `--c-border:${p.border}`,
  ].join(";");

const radius = { sharp: ["2px", "4px", "0px"], soft: ["10px", "22px", "999px"], pill: ["16px", "32px", "999px"] } as const;

/** design (JSON) → variables CSS. Los componentes solo leen roles. */
export function themeCss(d: DesignData): string {
  const [sm, lg, pill] = radius[d.theme.radius];
  const density = d.dials.density; // 1 aireado … 10 compacto
  const sectionY = Math.round(176 - density * 12); // px en escritorio
  const m = d.dials.motion;
  const base = [
    `--r-sm:${sm}`,
    `--r-lg:${lg}`,
    `--r-pill:${pill}`,
    `--section-y:${sectionY}px`,
    `--section-y-mobile:${Math.round(sectionY * 0.62)}px`,
    `--motion-dist:${m * 4}px`,
    `--motion-dur:${(0.35 + m * 0.06).toFixed(2)}s`,
    `color-scheme:${d.theme.mode === "light" ? "light" : d.theme.mode === "dark" ? "dark" : "light dark"}`,
  ].join(";");
  const { light, dark } = d.theme.colors;
  if (d.theme.mode === "light") return `:root{${base};${vars(light)}}`;
  if (d.theme.mode === "dark") return `:root{${base};${vars(dark)}}`;
  return `:root{${base};${vars(light)}}@media (prefers-color-scheme: dark){:root{${vars(dark)}}}`;
}
