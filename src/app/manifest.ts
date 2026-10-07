import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSite();
  const c = site.design.theme.colors.dark;
  return {
    name: site.site.legalName ?? site.site.name,
    short_name: site.site.logoText,
    description: site.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: c.bg,
    theme_color: c.bg,
    lang: "es-CR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
