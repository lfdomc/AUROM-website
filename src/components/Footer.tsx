import type { SiteData } from "@/lib/schema";
import { SmartLink } from "./ui/Button";
import { Logo } from "./ui/Logo";

export function Footer({ site }: { site: SiteData }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="container-x pb-10 pt-20 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo text={site.site.logoText} />
            <p className="mt-7 max-w-[26ch] font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
              {site.footer.statement}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            {site.footer.columns.map((col) => (
              <div key={col.title} className={col.title === "Contacto" ? "col-span-2 sm:col-span-1" : ""}>
                <h2 className="font-sans text-sm font-semibold tracking-normal text-ink">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <SmartLink site={site} href={l.href} className="text-[0.95rem] text-ink-muted transition-colors hover:text-ink">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-20 select-none whitespace-nowrap font-display text-[clamp(4.5rem,21vw,19rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_var(--c-border)]"
        >
          {site.site.logoText}
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>{site.footer.legal.replace("{year}", String(year))}</p>
          <p>{site.site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
