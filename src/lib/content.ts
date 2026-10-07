import "server-only";
import { cache } from "react";
import raw from "../../content/site.json";
import { SiteSchema, type SiteData, type PageData } from "./schema";

/**
 * Fuente de verdad: content/site.json.
 * Para leer desde Postgres (JSONB), reemplace loadRaw() por un
 * SELECT contenido FROM sitios WHERE slug = 'aurom' AND estado = 'publicado' ORDER BY version DESC LIMIT 1
 * (ver db/schema.sql). El contrato de validación es el mismo.
 */
async function loadRaw(): Promise<unknown> {
  return raw;
}

export const getSite = cache(async (): Promise<SiteData> => {
  const parsed = SiteSchema.safeParse(await loadRaw());
  if (!parsed.success) {
    throw new Error(
      "site.json no es válido:\n" +
        parsed.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n"),
    );
  }
  return parsed.data;
});

export async function getPage(slug: string): Promise<PageData | undefined> {
  return (await getSite()).pages.find((p) => p.slug === slug);
}
