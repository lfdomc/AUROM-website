/**
 * Avisa a Bing, Yandex, Seznam y otros buscadores que participan en IndexNow que el sitio cambió,
 * para que vuelvan a rastrear las páginas en minutos y no en días.
 * Uso: npm run indexnow (después de publicar). Google no usa IndexNow: para Google, Search Console + sitemap.
 */
import { readFileSync } from "node:fs";
import { SiteSchema } from "../src/lib/schema";

const site = SiteSchema.parse(JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8")));
const key = site.seo.indexNowKey;
if (!key) {
  console.error("Falta seo.indexNowKey en content/site.json");
  process.exit(1);
}
const host = new URL(site.site.url).host;
const urlList = site.pages.filter((p) => !p.seo.noindex).map((p) => (p.slug ? `${site.site.url}/${p.slug}` : site.site.url));

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${site.site.url}/${key}.txt`, urlList }),
});
console.log(res.ok ? `✓ IndexNow: ${urlList.length} páginas enviadas (${res.status})` : `✗ IndexNow respondió ${res.status}: ${await res.text()}`);
