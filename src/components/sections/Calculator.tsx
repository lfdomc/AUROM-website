import type { PageData, SectionData, SiteData } from "@/lib/schema";
import { ACTUALIZADO, VIGENCIA, datos, type Fuente } from "@/lib/planilla";
import { pageUrl } from "@/lib/links";
import { CalcClient } from "../calc/CalcClient";
import { ProximoFeriado } from "../calc/tools-otros";
import { TABLES } from "../calc/tables";
import { Shell } from "./Shell";

type Props = { section: Extract<SectionData, { type: "calculator" }>; site: SiteData; page: PageData };

/** Fuentes oficiales por calculadora (vienen de content/datos-cr.json). */
const FUENTES: Record<string, Fuente[]> = {
  "salario-neto": [...datos.renta.fuentes, ...datos.ccss.fuentes],
  aguinaldo: datos.aguinaldo.fuentes,
  liquidacion: datos.codigo_trabajo.fuentes,
  "costo-patronal": datos.ccss.fuentes,
  "horas-extra": datos.codigo_trabajo.fuentes,
  vacaciones: datos.codigo_trabajo.fuentes,
  "salario-minimo": datos.salario_minimo.fuentes,
  feriados: datos.feriados.fuentes,
  construccion: datos.construccion.fuentes,
  "ahorro-automatizacion": datos.ccss.fuentes,
};

const LEAD: Record<string, [string, string]> = {
  construccion: ["¿Necesita el presupuesto detallado de su obra, con cantidades y precios reales? Lo automatizamos.", "Cotizar mi presupuesto"],
  "ahorro-automatizacion": ["¿Quiere recuperar esas horas? Le decimos qué se puede automatizar en su empresa.", "Quiero automatizar esta tarea"],
};
const LEAD_DEFAULT: [string, string] = ["¿Calcula esto para 20 colaboradores cada mes? Lo automatizamos con su planilla en Odoo.", "Hablemos de su planilla"];

export function Calculator({ section: s, site, page }: Props) {
  const tables = TABLES[s.kind];
  const fuentes = [...(s.sources ?? []), ...(FUENTES[s.kind] ?? [])].filter((f, i, a) => a.findIndex((x) => x.url === f.url) === i);
  const [lead, leadLabel] = s.lead ? [s.lead, LEAD[s.kind]?.[1] ?? LEAD_DEFAULT[1]] : (LEAD[s.kind] ?? LEAD_DEFAULT);
  const n = site.contact.whatsapp.replace(/\D/g, "");
  const leadHref = `https://wa.me/${n}?text=${encodeURIComponent(`Hola, usé la herramienta "${page.navLabel ?? page.seo.title}" en su sitio y me interesa automatizar este proceso en mi empresa.`)}`;

  return (
    <Shell id={s.id ?? "calculadora"} background={s.background}>
      <div className="container-x">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] font-bold">{s.heading}</h2>
          {s.intro && <p className="mt-4 max-w-[62ch] text-lg text-ink-muted">{s.intro}</p>}
          <p className="mt-3 text-[0.88rem] text-ink-muted">
            Datos vigentes {VIGENCIA} · actualizado en {ACTUALIZADO}
          </p>
        </div>
        {s.kind === "feriados" && (
          <div className="mb-6">
            <ProximoFeriado />
          </div>
        )}
        <CalcClient
          ctx={{
            kind: s.kind,
            slug: page.slug,
            pageUrl: pageUrl(site, page.slug),
            lead,
            leadLabel,
            leadHref,
            brand: { name: site.site.name, tagline: site.site.tagline, site: site.site.url.replace(/^https?:\/\//, ""), whatsapp: `+${n.slice(0, 3)} ${n.slice(3, 7)} ${n.slice(7)}` },
          }}
        />
        {tables.length > 0 && (
          <div className={`mt-12 grid gap-6 ${tables.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {tables.map((T, i) => (
              <T key={i} />
            ))}
          </div>
        )}
        {fuentes.length > 0 && (
          <p className="mt-8 text-[0.85rem] text-ink-muted">
            Fuentes:{" "}
            {fuentes.map((src, i) => (
              <span key={src.url}>
                {i > 0 && " · "}
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
                  {src.label}
                </a>
              </span>
            ))}
          </p>
        )}
      </div>
    </Shell>
  );
}
