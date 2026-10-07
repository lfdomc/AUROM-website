import { getSite } from "@/lib/content";
import { pageUrl } from "@/lib/links";

export const dynamic = "force-static";

/** /llms.txt: resumen del sitio para buscadores con inteligencia artificial (ChatGPT, Perplexity, Gemini). */
export async function GET() {
  const site = await getSite();
  const solutions = site.pages.filter((p) => p.slug.startsWith("soluciones/"));
  const others = site.pages.filter((p) => p.slug !== "" && !p.slug.startsWith("soluciones/"));
  const line = (p: (typeof site.pages)[number]) => `- [${p.navLabel ?? p.seo.title}](${pageUrl(site, p.slug)}): ${p.seo.description}`;
  const body = [
    `# ${site.site.legalName ?? site.site.name}`,
    "",
    `> ${site.seo.description}`,
    "",
    `${site.site.name} es una empresa de ${site.site.tagline.toLowerCase()} con sede en Costa Rica. Atiende a empresas en ${site.contact.areaServed.join(", ")}.`,
    `Contacto: WhatsApp ${site.contact.whatsapp}. Sitio: ${site.site.url}`,
    "",
    "## Soluciones",
    ...solutions.map(line),
    "",
    "## Más información",
    ...others.map(line),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
