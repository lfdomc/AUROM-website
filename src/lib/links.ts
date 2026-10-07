import type { SiteData } from "./schema";

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
