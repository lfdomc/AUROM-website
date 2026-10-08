import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSite } from "@/lib/content";
import { themeCss } from "@/lib/theme";
import { fontRegistry } from "@/lib/fonts";
import { resolveHref } from "@/lib/links";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(site.site.url),
    title: { default: site.seo.defaultTitle, template: site.seo.titleTemplate },
    description: site.seo.description,
    applicationName: site.site.name,
    authors: [{ name: site.site.name, url: site.site.url }],
    creator: site.site.name,
    publisher: site.site.name,
    formatDetection: { telephone: false },
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
    manifest: "/manifest.webmanifest",
    other: {
      "geo.region": site.contact.country,
      ...(site.seo.verification.bing ? { "msvalidate.01": site.seo.verification.bing } : {}),
    },
    ...(site.seo.verification.google ? { verification: { google: site.seo.verification.google } } : {}),
  };
}

export async function generateViewport(): Promise<Viewport> {
  const site = await getSite();
  const c = site.design.theme.mode === "light" ? site.design.theme.colors.light : site.design.theme.colors.dark;
  return { themeColor: c.bg, width: "device-width", initialScale: 1, viewportFit: "cover" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const { fonts } = site.design.theme;
  const chosen = [...new Set([fonts.display, fonts.body, fonts.mono])];
  const fontClasses = chosen.map((k) => fontRegistry[k].font.variable).join(" ");
  const fontVars = `:root{--font-display-src:var(${fontRegistry[fonts.display].cssVar});--font-body-src:var(${fontRegistry[fonts.body].cssVar});--font-mono-src:var(${fontRegistry[fonts.mono].cssVar})}`;
  const cta = resolveHref(site.navigation.cta.href, site);

  return (
    // suppressHydrationWarning: extensiones (modo oscuro, traductores, gestores de contraseñas) cambian atributos de <html>.
    <html lang="es-CR" className={fontClasses} suppressHydrationWarning>
      <head>
        {/* Estilo del tema como recurso de React 19 (href + precedence): React lo ubica en <head> y no lo
            compara posición por posición, así una extensión que inserte su propio <style> no rompe la hidratación. */}
        <style href="aurom-theme" precedence="high">
          {themeCss(site.design) + fontVars}
        </style>
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-pill focus:bg-accent focus:px-5 focus:py-3 focus:font-semibold focus:text-accent-ink">
          Saltar al contenido
        </a>
        <MotionRoot intensity={site.design.dials.motion} smoothScroll={site.design.motion.smoothScroll} scrollProgress={site.design.motion.scrollProgress}>
          <Nav logoText={site.site.logoText} items={site.navigation.items} cta={{ label: site.navigation.cta.label, href: cta.href }} />
          <main id="contenido">{children}</main>
          <Footer site={site} />
        </MotionRoot>
        {site.seo.ga4Id && <Analytics id={site.seo.ga4Id} />}
      </body>
    </html>
  );
}
