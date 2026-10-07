import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

const fileFor = (slug: string) => `${slug ? slug.replace(/\//g, "--") : "inicio"}.png`;

export async function generateStaticParams() {
  const site = await getSite();
  return site.pages.map((p) => ({ file: fileFor(p.slug) }));
}

const C = { bg: "#12151c", panel: "#1b1f29", line: "#2c3240", ink: "#f4f1ea", muted: "#a9b0bf", gold: "#efbc4f", goldInk: "#2a2110" };

/**
 * Imagen para compartir (WhatsApp, Facebook, LinkedIn, X) 1200×630, una por página, generada desde el JSON:
 * marca, titular y a la derecha el flujo propio de esa página.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const site = await getSite();
  const page = site.pages.find((p) => fileFor(p.slug) === file);
  if (!page) return new Response("No encontrado", { status: 404 });

  const [display, body] = await Promise.all([
    readFile(join(process.cwd(), "src/fonts/og/bricolage-800.woff")),
    readFile(join(process.cwd(), "src/fonts/og/manrope-500.woff")),
  ]);
  const hero = page.sections.find((s) => s.type === "hero");
  const title = hero && hero.type === "hero" ? hero.headline : page.seo.title;
  const kicker = page.navLabel ?? (hero && hero.type === "hero" && hero.kicker ? hero.kicker : site.site.tagline);

  // pasos de la derecha: el flujo del hero (inicio) o el proceso de la página
  const pipe = page.sections.find((s) => s.type === "pipeline");
  const steps: string[] =
    hero && hero.type === "hero" && hero.flow
      ? hero.flow.slice(0, 4).map((l) => l.output)
      : pipe && pipe.type === "pipeline"
        ? pipe.steps.slice(0, 4).map((s) => s.title)
        : ["Diagnóstico", "Prototipo", "Implementación", "Soporte"];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, color: C.ink, fontFamily: "Manrope", position: "relative" }}>
        {/* retícula */}
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
            backgroundSize: "60px 60px", opacity: 0.35,
          }}
        />
        <div style={{ position: "absolute", right: -140, top: -160, width: 620, height: 620, borderRadius: 999, display: "flex",
          background: "radial-gradient(circle, rgba(239,188,79,0.22), rgba(239,188,79,0) 65%)" }} />

        {/* columna izquierda */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 60px 72px", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="9" fill="#262b36" />
              <path d="M8.5 23.5 L16 8 L23.5 23.5" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.6 17.6 H20.4" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="16" cy="8" r="3.1" fill={C.gold} />
            </svg>
            <div style={{ fontFamily: "Bricolage", fontSize: 32, letterSpacing: 6 }}>{site.site.logoText}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 26, color: C.gold }}>{kicker}</div>
            <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: title.length > 44 ? 62 : 72, lineHeight: 1.02, letterSpacing: -2 }}>{title}</div>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 24, color: C.muted }}>
            <div style={{ display: "flex" }}>{site.site.url.replace(/^https?:\/\//, "")}</div>
            <div style={{ display: "flex", color: C.ink }}>{`WhatsApp ${site.contact.whatsapp.replace(/^\+506(\d{4})(\d{4})$/, "+506 $1 $2")}`}</div>
          </div>
        </div>

        {/* columna derecha: flujo */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "0 64px 0 20px", flex: 1 }}>
          {steps.map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 999,
                background: i === steps.length - 1 ? C.gold : C.panel, border: `2px solid ${C.gold}`, color: i === steps.length - 1 ? C.goldInk : C.gold,
                fontFamily: "Bricolage", fontSize: 20 }}>
                {i === steps.length - 1 ? (
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.goldInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  String(i + 1)
                )}
              </div>
              <div style={{ display: "flex", flex: 1, padding: "16px 20px", borderRadius: 14, background: C.panel, border: `1px solid ${i === steps.length - 1 ? C.gold : C.line}`, fontSize: 23, color: C.ink }}>
                {t}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Manrope", data: body, weight: 500, style: "normal" },
      ],
    },
  );
}
