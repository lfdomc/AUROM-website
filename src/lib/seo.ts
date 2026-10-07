import type { Metadata } from "next";
import type { PageData, SiteData } from "./schema";
import { pageUrl } from "./links";

export function buildMetadata(site: SiteData, page: PageData): Metadata {
  const url = pageUrl(site, page.slug);
  const isHome = page.slug === "";
  const title = isHome ? { absolute: site.seo.defaultTitle } : page.seo.title;
  const fullTitle = isHome ? site.seo.defaultTitle : site.seo.titleTemplate.replace("%s", page.seo.title);
  const ogImage = `${site.site.url}/og/${page.slug ? page.slug.replace(/\//g, "--") : "inicio"}.png`;

  return {
    title,
    description: page.seo.description,
    keywords: [...(page.seo.keywords ?? []), ...site.seo.keywords],
    alternates: { canonical: url },
    robots: page.seo.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "website",
      locale: "es_CR",
      alternateLocale: site.seo.alternateLocales,
      url,
      siteName: site.site.name,
      title: fullTitle,
      description: page.seo.description,
      // WhatsApp, Facebook y LinkedIn leen esta imagen: absoluta, PNG 1200×630, < 300 KB.
      images: [{ url: ogImage, secureUrl: ogImage, type: "image/png", width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: page.seo.description, images: [ogImage] },
  };
}

const areaServed = (site: SiteData) =>
  site.contact.areaServed.map((name) =>
    name === "Latinoamérica" ? { "@type": "Place", name } : { "@type": "Country", name },
  );

export function buildJsonLd(site: SiteData, page: PageData): object[] {
  const orgId = `${site.site.url}/#organizacion`;
  const url = pageUrl(site, page.slug);
  const graph: object[] = [];

  if (page.slug === "") {
    const services = site.pages.filter((p) => p.seo.service);
    graph.push(
      {
        "@type": site.seo.organizationType,
        "@id": orgId,
        name: site.site.name,
        legalName: site.site.legalName,
        alternateName: [site.site.logoText, "AUROM Tec"],
        description: site.seo.description,
        slogan: site.site.tagline,
        url: site.site.url,
        logo: `${site.site.url}/icon.svg`,
        image: `${site.site.url}/og/inicio.png`,
        telephone: site.contact.whatsapp,
        ...(site.contact.email ? { email: site.contact.email } : {}),
        address: { "@type": "PostalAddress", addressCountry: site.contact.country },
        areaServed: areaServed(site),
        knowsAbout: [
          "Automatización de procesos empresariales",
          "Odoo",
          "Planillas",
          "Chatbots con inteligencia artificial",
          "SICOP",
          "Presupuestos de construcción",
          "Mantenimiento de equipos",
          "Análisis de datos",
          "Desarrollo de software a la medida",
        ],
        knowsLanguage: ["es", "en"],
        sameAs: [site.contact.github].filter(Boolean),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.contact.whatsapp,
          contactType: "sales",
          availableLanguage: ["Spanish", "English"],
          areaServed: site.contact.country,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Soluciones de automatización y software",
          itemListElement: services.map((p) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: p.seo.service!.name, url: pageUrl(site, p.slug) },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.site.url}/#sitio`,
        url: site.site.url,
        name: site.site.name,
        inLanguage: "es-CR",
        publisher: { "@id": orgId },
      },
    );
  }

  graph.push({
    "@type": "WebPage",
    "@id": `${url}#pagina`,
    url,
    name: page.seo.title,
    description: page.seo.description,
    inLanguage: "es-CR",
    isPartOf: { "@id": `${site.site.url}/#sitio` },
    about: { "@id": orgId },
  });

  if (page.slug !== "") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: site.site.url },
        { "@type": "ListItem", position: 2, name: page.navLabel ?? page.seo.title, item: url },
      ],
    });
  }

  if (page.seo.service) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#servicio`,
      name: page.seo.service.name,
      serviceType: page.seo.service.serviceType,
      description: page.seo.description,
      url,
      provider: { "@id": orgId, "@type": site.seo.organizationType, name: site.site.name, url: site.site.url },
      areaServed: areaServed(site),
      availableChannel: {
        "@type": "ServiceChannel",
        servicePhone: { "@type": "ContactPoint", telephone: site.contact.whatsapp },
      },
    });
  }

  const index = page.sections.find((s) => s.type === "solutionIndex");
  if (index && index.type === "solutionIndex") {
    graph.push({
      "@type": "ItemList",
      name: index.heading,
      itemListElement: index.items.map((it, i) => {
        const p = site.pages.find((x) => x.slug === it.slug);
        return { "@type": "ListItem", position: i + 1, name: p?.navLabel ?? p?.seo.title, url: pageUrl(site, it.slug) };
      }),
    });
  }

  const faqs = page.sections.flatMap((s) => (s.type === "faq" ? s.items : []));
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return [{ "@context": "https://schema.org", "@graph": graph }];
}

/** Serializa JSON-LD sin permitir cerrar el <script>. */
export function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
