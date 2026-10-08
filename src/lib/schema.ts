import { z } from "zod";

/* ─────────────────────────  Piezas comunes  ───────────────────────── */

const Text = (max: number) => z.string().trim().min(1).max(max);

export const Link = z.object({
  label: Text(32),
  href: z.string().min(1),
});

const Background = z.enum(["base", "surface", "accent", "inverse"]).default("base");

const Motion = z
  .object({
    reveal: z.enum(["fade-up", "mask", "blur", "stagger", "scale", "none"]).default("fade-up"),
    delay: z.number().min(0).max(2).default(0),
  })
  .default({ reveal: "fade-up", delay: 0 });

export const IconName = z.enum([
  "code",
  "globe",
  "stack",
  "plugs",
  "chart",
  "gauge",
  "users",
  "chat",
  "robot",
  "magnifier",
  "calculator",
  "house",
  "bell",
  "lock",
  "clock",
  "file",
  "flow",
  "whatsapp",
  "spark",
  "buildings",
  "wrench",
  "envelope",
  "map",
  "video",
  "shield",
  "lightning",
  "heart",
  "target",
]);
export type IconName = z.infer<typeof IconName>;

export const VisualName = z.enum(["payroll", "airbnb", "assistant", "sicop", "budget", "data", "maintenance", "email", "website", "orbit"]);
export type VisualName = z.infer<typeof VisualName>;

const base = {
  id: z.string().optional(),
  background: Background,
  motion: Motion,
};

/* ─────────────────────────  Secciones  ───────────────────────── */

const Hero = z.object({
  ...base,
  type: z.literal("hero"),
  variant: z.enum(["flow", "page"]).default("page"),
  kicker: Text(100).optional().describe("Se publica como H1: la frase que la gente busca en Google"),
  headline: Text(90),
  emphasis: z.string().optional().describe("Palabra(s) del titular que van en cursiva"),
  subhead: Text(220),
  primary: Link,
  secondary: Link.optional(),
  visual: VisualName.optional(),
  flow: z
    .array(z.object({ input: Text(40), output: Text(40) }))
    .min(3)
    .max(4)
    .optional(),
});

const Marquee = z.object({
  ...base,
  type: z.literal("marquee"),
  label: Text(80).optional(),
  items: z.array(Text(60)).min(4).max(14),
});

const StickyStack = z.object({
  ...base,
  type: z.literal("stickyStack"),
  heading: Text(90),
  intro: Text(260).optional(),
  items: z
    .array(
      z.object({
        title: Text(60),
        tag: Text(40),
        problem: Text(220),
        result: Text(220),
        bullets: z.array(Text(90)).min(2).max(4),
        href: z.string(),
        visual: VisualName,
      }),
    )
    .min(2)
    .max(10),
});

const Bento = z.object({
  ...base,
  type: z.literal("bento"),
  heading: Text(90),
  intro: Text(260).optional(),
  cells: z
    .array(
      z.object({
        title: Text(60),
        body: Text(240),
        icon: IconName,
        size: z.enum(["lg", "wide", "md", "sm"]).default("md"),
        tone: z.enum(["base", "surface", "accent", "inverse"]).default("surface"),
        href: z.string().optional(),
      }),
    )
    .min(2)
    .max(7),
});

const Horizontal = z.object({
  ...base,
  type: z.literal("horizontal"),
  heading: Text(90),
  intro: Text(260).optional(),
  steps: z
    .array(z.object({ title: Text(50), body: Text(260), detail: Text(60).optional() }))
    .min(3)
    .max(7),
});

const Stats = z.object({
  ...base,
  type: z.literal("stats"),
  heading: Text(90).optional(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.number(),
        prefix: z.string().max(4).optional(),
        suffix: z.string().max(6).optional(),
        label: Text(90),
      }),
    )
    .min(2)
    .max(4),
});

const BeforeAfter = z.object({
  ...base,
  type: z.literal("beforeAfter"),
  heading: Text(90),
  before: z.object({ title: Text(40), items: z.array(Text(140)).min(2).max(6) }),
  after: z.object({ title: Text(40), items: z.array(Text(140)).min(2).max(6) }),
});

const Features = z.object({
  ...base,
  type: z.literal("features"),
  heading: Text(90),
  intro: Text(300).optional(),
  items: z
    .array(z.object({ title: Text(60), body: Text(260), icon: IconName }))
    .min(2)
    .max(8),
});

const Pipeline = z.object({
  ...base,
  type: z.literal("pipeline"),
  variant: z.enum(["track", "timeline", "stairs", "circuit", "deck", "checklist", "path", "tabs"]).default("track"),
  heading: Text(90),
  intro: Text(260).optional(),
  steps: z.array(z.object({ title: Text(40), body: Text(160).optional(), icon: IconName.optional() })).min(3).max(6),
  result: Text(90),
});

const Portfolio = z.object({
  ...base,
  type: z.literal("portfolio"),
  heading: Text(90),
  intro: Text(260).optional(),
  items: z
    .array(z.object({ name: Text(50), url: z.url(), sector: Text(60), description: Text(220) }))
    .min(1)
    .max(12),
});

const SolutionIndex = z.object({
  ...base,
  type: z.literal("solutionIndex"),
  heading: Text(90),
  intro: Text(260).optional(),
  items: z.array(z.object({ slug: z.string(), icon: IconName, tag: Text(40) })).min(1).max(16),
});

const Clients = z.object({
  ...base,
  type: z.literal("clients"),
  variant: z.enum(["full", "compact"]).default("full"),
  heading: Text(90),
  items: z.array(z.object({ name: Text(40), detail: Text(80).optional(), url: z.url().optional() })).min(1).max(24),
  more: Text(80).optional(),
  highlight: z.object({ value: z.number(), label: Text(120) }).optional(),
});

const Faq = z.object({
  ...base,
  type: z.literal("faq"),
  heading: Text(90),
  items: z.array(z.object({ q: Text(140), a: Text(700) })).min(2).max(12),
});

const Related = z.object({
  ...base,
  type: z.literal("related"),
  heading: Text(90),
  slugs: z.array(z.string()).min(1).max(10),
});

const Cta = z.object({
  ...base,
  type: z.literal("cta"),
  headline: Text(90),
  body: Text(260).optional(),
  primary: Link,
  secondary: Link.optional(),
});

const RichText = z.object({
  ...base,
  type: z.literal("richText"),
  heading: Text(90),
  paragraphs: z.array(Text(900)).min(1).max(8),
});

const Calculator = z.object({
  ...base,
  type: z.literal("calculator"),
  kind: z.enum(["salario-neto", "aguinaldo", "liquidacion", "costo-patronal", "horas-extra", "vacaciones", "salario-minimo", "feriados", "construccion", "ahorro-automatizacion"]).describe("Qué calculadora mostrar (reglas en src/lib/planilla.ts)"),
  heading: Text(90),
  intro: Text(300).optional(),
  sources: z.array(z.object({ label: Text(80), url: z.url() })).max(6).optional(),
  lead: Text(160).optional().describe("Mensaje para captar clientes debajo del resultado"),
});

export const Section = z.discriminatedUnion("type", [
  Calculator,
  Hero,
  Marquee,
  StickyStack,
  Bento,
  Horizontal,
  Stats,
  BeforeAfter,
  Features,
  Faq,
  Related,
  Cta,
  RichText,
  Clients,
  Pipeline,
  Portfolio,
  SolutionIndex,
]);
export type SectionData = z.infer<typeof Section>;

/* ─────────────────────────  Páginas, SEO y diseño  ───────────────────────── */

const PageSeo = z.object({
  title: Text(70),
  description: z.string().min(50).max(170),
  keywords: z.array(z.string()).optional(),
  noindex: z.boolean().default(false),
  priority: z.number().min(0).max(1).default(0.7),
  changeFrequency: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .default("monthly"),
  service: z
    .object({ name: Text(80), serviceType: Text(80) })
    .optional()
    .describe("Si existe, la página genera JSON-LD de tipo Service"),
  article: z
    .object({ published: z.iso.date(), modified: z.iso.date().optional() })
    .optional()
    .describe("Si existe, la página es un artículo y genera JSON-LD de tipo BlogPosting"),
});

export const Page = z.object({
  slug: z.string().regex(/^$|^[a-z0-9-]+(\/[a-z0-9-]+)*$/, "slug en minúsculas, sin / inicial"),
  navLabel: Text(40).optional(),
  seo: PageSeo,
  sections: z.array(Section).min(1),
});
export type PageData = z.infer<typeof Page>;

const Palette = z.object({
  bg: z.string(),
  surface: z.string(),
  surface2: z.string(),
  ink: z.string(),
  inkMuted: z.string(),
  accent: z.string(),
  accentInk: z.string(),
  accentText: z.string(),
  border: z.string(),
});

export const FontKey = z.enum(["bricolage", "manrope", "jetbrains"]);

const Design = z.object({
  read: z.string(),
  dials: z.object({
    variance: z.number().int().min(1).max(10),
    motion: z.number().int().min(1).max(10),
    density: z.number().int().min(1).max(10),
  }),
  theme: z.object({
    mode: z.enum(["light", "dark", "system"]),
    fonts: z.object({ display: FontKey, body: FontKey, mono: FontKey }),
    colors: z.object({ light: Palette, dark: Palette }),
    radius: z.enum(["sharp", "soft", "pill"]),
  }),
  motion: z
    .object({ smoothScroll: z.boolean().default(true), scrollProgress: z.boolean().default(true) })
    .default({ smoothScroll: true, scrollProgress: true }),
});
export type DesignData = z.infer<typeof Design>;

export const SiteSchema = z
  .object({
    $schema: z.string().optional(),
    version: z.literal(1),
    site: z.object({
      name: Text(40),
      legalName: Text(120).optional(),
      tagline: Text(120),
      url: z.url(),
      locale: z.string().default("es"),
      logoText: Text(20),
      logoMark: Text(4),
    }),
    contact: z.object({
      whatsapp: z.string().regex(/^\+\d{8,15}$/),
      whatsappMessage: z.string().default(""),
      email: z.email().optional(),
      github: z.url().optional(),
      country: z.string().length(2),
      city: z.string().optional(),
      region: z.string().optional(),
      areaServed: z.array(z.string()).min(1),
    }),
    seo: z.object({
      titleTemplate: z.string().includes("%s"),
      defaultTitle: Text(70),
      description: z.string().min(50).max(170),
      keywords: z.array(z.string()),
      organizationType: z.enum(["Organization", "ProfessionalService", "LocalBusiness"]),
      alternateLocales: z.array(z.string()).default([]),
      verification: z
        .object({ google: z.string().optional(), bing: z.string().optional() })
        .default({})
        .describe("Códigos de verificación de Google Search Console y Bing Webmaster Tools"),
      ga4Id: z.string().regex(/^G-[A-Z0-9]{4,}$/).optional().describe("ID de medición de Google Analytics 4 (G-XXXXXXX)"),
      indexNowKey: z.string().regex(/^[a-f0-9]{32}$/).optional().describe("Clave IndexNow (archivo public/<clave>.txt)"),
    }),
    design: Design,
    navigation: z.object({
      items: z.array(Link).min(1).max(6),
      cta: Link,
    }),
    footer: z.object({
      statement: Text(140),
      columns: z.array(z.object({ title: Text(40), links: z.array(Link) })).max(4),
      legal: Text(160),
    }),
    pages: z.array(Page).min(1),
  })
  .superRefine((site, ctx) => {
    const seen = new Set<string>();
    site.pages.forEach((p, i) => {
      if (seen.has(p.slug)) ctx.addIssue({ code: "custom", path: ["pages", i, "slug"], message: `slug repetido: "${p.slug}"` });
      seen.add(p.slug);
      const heroes = p.sections.filter((s) => s.type === "hero").length;
      if (heroes !== 1)
        ctx.addIssue({ code: "custom", path: ["pages", i, "sections"], message: `cada página necesita exactamente 1 hero (tiene ${heroes})` });
      if (p.sections[0]?.type !== "hero")
        ctx.addIssue({ code: "custom", path: ["pages", i, "sections", 0], message: "la primera sección debe ser el hero" });
      p.sections.forEach((s, j) => {
        if (s.type === "solutionIndex")
          s.items.forEach((it, k) => {
            if (!site.pages.some((x) => x.slug === it.slug))
              ctx.addIssue({ code: "custom", path: ["pages", i, "sections", j, "items", k, "slug"], message: `no existe la página "${it.slug}"` });
          });
        if (s.type === "related")
          s.slugs.forEach((slug, k) => {
            if (!site.pages.some((x) => x.slug === slug))
              ctx.addIssue({ code: "custom", path: ["pages", i, "sections", j, "slugs", k], message: `no existe la página "${slug}"` });
          });
      });
    });
    if (!seen.has("")) ctx.addIssue({ code: "custom", path: ["pages"], message: 'falta la portada (slug "")' });
  });

export type SiteData = z.infer<typeof SiteSchema>;
