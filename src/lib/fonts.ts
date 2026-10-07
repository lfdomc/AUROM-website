import localFont from "next/font/local";

/* next/font exige una constante por fuente con opciones literales. Archivos autoalojados en src/fonts. */
const bricolage = localFont({ src: "../fonts/bricolage.woff2", variable: "--f-bricolage", display: "swap", weight: "200 800", preload: true });
const manrope = localFont({ src: "../fonts/manrope.woff2", variable: "--f-manrope", display: "swap", weight: "200 800", preload: true });
const jetbrains = localFont({ src: "../fonts/jetbrains.woff2", variable: "--f-jetbrains", display: "swap", weight: "100 800", preload: false });

export const fontRegistry = {
  bricolage: { font: bricolage, cssVar: "--f-bricolage" },
  manrope: { font: manrope, cssVar: "--f-manrope" },
  jetbrains: { font: jetbrains, cssVar: "--f-jetbrains" },
} as const;

export type FontKey = keyof typeof fontRegistry;
