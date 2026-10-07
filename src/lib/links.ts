import type { PageData, SiteData } from "./schema";

/** Resuelve atajos del JSON: "#whatsapp" abre WhatsApp con el mensaje configurado. */
export function resolveHref(href: string, site: SiteData): { href: string; external: boolean } {
  if (href === "#whatsapp") {
    const n = site.contact.whatsapp.replace(/\D/g, "");
    const text = site.contact.whatsappMessage ? `?text=${encodeURIComponent(site.contact.whatsappMessage)}` : "";
    return { href: `https://wa.me/${n}${text}`, external: true };
  }
  return { href, external: /^https?:\/\//.test(href) };
}

export function pageUrl(site: SiteData, slug: string) {
  return slug ? `${site.site.url}/${slug}` : site.site.url;
}

/** Ruta de navegación: Inicio › secciones padre que existan › página. Visible en el hero y en los datos para Google. */
export function breadcrumbs(site: SiteData, page: PageData): { name: string; href: string; url: string }[] {
  const out = [{ name: "Inicio", href: "/", url: site.site.url }];
  const parts = page.slug.split("/").filter(Boolean);
  for (let i = 1; i < parts.length; i++) {
    const slug = parts.slice(0, i).join("/");
    const parent = site.pages.find((p) => p.slug === slug);
    if (parent) out.push({ name: parent.navLabel ?? parent.seo.title, href: `/${slug}`, url: pageUrl(site, slug) });
  }
  if (page.slug) out.push({ name: page.navLabel ?? page.seo.title, href: `/${page.slug}`, url: pageUrl(site, page.slug) });
  return out;
}
