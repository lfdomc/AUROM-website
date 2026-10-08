import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { PageData, SectionData, SiteData } from "@/lib/schema";
import { breadcrumbs } from "@/lib/links";
import { Button } from "../ui/Button";
import { KineticHeadline } from "../motion/KineticHeadline";
import type { CSSProperties } from "react";
import { HeroFlow } from "../visuals/HeroFlow";
import { SolutionVisual } from "../visuals/SolutionVisual";

type Props = { section: Extract<SectionData, { type: "hero" }>; site: SiteData; page?: PageData };

export function Hero({ section: s, site, page }: Props) {
  const isFlow = s.variant === "flow";
  const crumbs = page && page.slug ? breadcrumbs(site, page) : [];
  return (
    <section className={`grain relative isolate overflow-hidden ${isFlow ? "min-h-[100dvh]" : ""} flex items-center`}>
      <div aria-hidden className="blueprint absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute -right-40 top-[-10%] -z-10 size-[44rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--c-accent) 14%, transparent), transparent 65%)" }}
      />
      <div className={`container-x grid w-full items-center gap-14 pt-28 lg:grid-cols-12 lg:gap-10 ${isFlow ? "pb-20 md:pt-32" : "pb-16 md:pb-24 md:pt-40"}`}>
        <div className={isFlow || s.visual ? "lg:col-span-6" : "lg:col-span-10"}>
          {crumbs.length > 1 && (
            <nav aria-label="Ruta de navegación" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem] text-ink-muted">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {i > 0 && <CaretRightIcon size={11} weight="bold" aria-hidden className="opacity-60" />}
                    {i < crumbs.length - 1 ? (
                      <Link href={c.href} className="transition-colors hover:text-ink">
                        {c.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-ink">
                        {c.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {/* SEO: el H1 es la frase que la gente busca; el titular creativo va grande debajo. */}
          {s.kicker && (
            <div className="rise">
              <h1 className="mb-6 inline-flex items-center gap-2.5 font-sans text-[0.95rem] font-medium leading-snug tracking-normal text-ink-muted">
                <span aria-hidden className="h-px w-8 shrink-0 bg-accent" />
                {s.kicker}
              </h1>
            </div>
          )}
          <KineticHeadline
            as={s.kicker ? "p" : "h1"}
            text={s.headline}
            emphasis={s.emphasis}
            className={`${isFlow ? "text-[clamp(2.75rem,6.6vw,5.6rem)]" : "text-[clamp(2.5rem,5.4vw,4.6rem)]"} font-extrabold leading-[0.98] tracking-[-0.035em]`}
          />
          <div>
            <p className="mt-7 max-w-[46ch] text-[1.15rem] leading-relaxed text-ink-muted md:text-xl">{s.subhead}</p>
          </div>
          <div className="rise" style={{ "--d": "0.4s" } as CSSProperties}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button site={site} href={s.primary.href} label={s.primary.label} size="lg" />
              {s.secondary && <Button site={site} href={s.secondary.href} label={s.secondary.label} variant="ghost" size="lg" />}
            </div>
          </div>
        </div>
        <div className={isFlow || s.visual ? "lg:col-span-6 lg:pl-6" : "hidden"}>
          <div className="rise" style={{ "--d": "0.3s", "--rise": "0px" } as CSSProperties}>
            {isFlow && s.flow ? (
              <HeroFlow lanes={s.flow} brand={site.site.logoText} />
            ) : s.visual ? (
              <div className="mx-auto max-w-md lg:ml-auto lg:mr-0">
                <SolutionVisual name={s.visual} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
