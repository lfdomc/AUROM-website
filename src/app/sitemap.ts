import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";
import { pageUrl } from "@/lib/links";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const now = new Date();
  return site.pages
    .filter((p) => !p.seo.noindex)
    .map((p) => ({
      url: pageUrl(site, p.slug),
      lastModified: now,
      changeFrequency: p.seo.changeFrequency,
      priority: p.seo.priority,
      images: [`${site.site.url}/og/${p.slug ? p.slug.replace(/\//g, "--") : "inicio"}.png`],
    }));
}
