import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData, SiteData } from "@/lib/schema";
import { Shell } from "./Shell";

type Props = { section: Extract<SectionData, { type: "related" }>; site: SiteData };

export function Related({ section: s, site }: Props) {
  const pages = s.slugs.map((slug) => site.pages.find((p) => p.slug === slug)!).filter(Boolean);
  return (
    <Shell id={s.id} background={s.background}>
      <div className="container-x">
        <h2 className="text-[clamp(1.6rem,3vw,2.3rem)] font-bold">{s.heading}</h2>
        <ul className="mt-8 border-t border-line">
          {pages.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link href={`/${p.slug}`} className="group flex items-center justify-between gap-6 py-6">
                <span>
                  <span className="block font-display text-[clamp(1.35rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent-text">
                    {p.navLabel ?? p.seo.title}
                  </span>
                  <span className="mt-1 block max-w-[70ch] text-[0.95rem] text-ink-muted">{p.seo.description}</span>
                </span>
                <ArrowRightIcon size={22} weight="bold" aria-hidden className="shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
