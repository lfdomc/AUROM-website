import type { SectionData, SiteData } from "@/lib/schema";
import { SolutionIndexList } from "./SolutionIndexList";

type Props = { section: Extract<SectionData, { type: "solutionIndex" }>; site: SiteData };

/** Resuelve en el servidor solo los datos de cada fila: así el sitio completo no viaja en el HTML de la página. */
export function SolutionIndex({ section: s, site }: Props) {
  const rows = s.items.flatMap((it) => {
    const p = site.pages.find((x) => x.slug === it.slug);
    return p ? [{ slug: it.slug, icon: it.icon, tag: it.tag, title: p.navLabel ?? p.seo.title, description: p.seo.description }] : [];
  });
  return <SolutionIndexList id={s.id} heading={s.heading} intro={s.intro} rows={rows} />;
}
