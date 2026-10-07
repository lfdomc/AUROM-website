import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { SiteSchema } from "../src/lib/schema";

const raw = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));
const parsed = SiteSchema.safeParse(raw);
if (!parsed.success) {
  console.error("✗ content/site.json no es válido:\n" +
    parsed.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n"));
  process.exit(1);
}
const schema = z.toJSONSchema(SiteSchema, { io: "input", unrepresentable: "any" });
writeFileSync(new URL("../content/site.schema.json", import.meta.url), JSON.stringify(schema, null, 2));
const d = parsed.data;
console.log(`✓ site.json válido · ${d.pages.length} páginas · ${d.pages.reduce((n, p) => n + p.sections.length, 0)} secciones · esquema exportado`);
