import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { getPage, getSite } from "@/lib/content";
import { buildJsonLd, buildMetadata, safeJson } from "@/lib/seo";
import { registry } from "@/components/registry";
import type { SectionData, SiteData } from "@/lib/schema";

export const dynamicParams = false;

type Params = { slug?: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  const site = await getSite();
  return site.pages.map((p) => ({ slug: p.slug ? p.slug.split("/") : [] }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const site = await getSite();
  const page = await getPage((slug ?? []).join("/"));
  if (!page) return {};
  return buildMetadata(site, page);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const site = await getSite();
  const page = await getPage((slug ?? []).join("/"));
  if (!page) notFound();

  return (
    <>
      {buildJsonLd(site, page).map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(d) }} />
      ))}
      {page.sections.map((s, i) => {
        const C = registry[s.type] as ComponentType<{ section: SectionData; site: SiteData }>;
        return <C key={s.id ?? `${s.type}-${i}`} section={s} site={site} />;
      })}
    </>
  );
}
