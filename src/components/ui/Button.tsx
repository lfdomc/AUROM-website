import Link from "next/link";
import { ArrowUpRightIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import type { SiteData } from "@/lib/schema";
import { resolveHref } from "@/lib/links";

type Props = {
  site: SiteData;
  href: string;
  label: string;
  variant?: "primary" | "ghost" | "inverse";
  size?: "md" | "lg";
  className?: string;
};

const styles = {
  primary:
    "bg-accent text-accent-ink hover:bg-[color-mix(in_oklch,var(--c-accent)_88%,white)] shadow-[0_10px_30px_-12px_color-mix(in_oklch,var(--c-accent)_70%,transparent)]",
  ghost: "border border-line text-ink hover:border-ink-muted hover:bg-surface",
  inverse: "bg-accent-ink text-ink hover:bg-[color-mix(in_oklch,var(--c-accent-ink)_85%,white)]",
};

export function Button({ site, href, label, variant = "primary", size = "md", className = "" }: Props) {
  const r = resolveHref(href, site);
  const isWa = href === "#whatsapp";
  const cls = `group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.97] ${
    size === "lg" ? "h-13 px-7 text-[1.0625rem]" : "h-11 px-5 text-[0.95rem]"
  } ${styles[variant]} ${className}`;
  const icon = isWa ? (
    <WhatsappLogoIcon size={19} weight="bold" aria-hidden />
  ) : r.external ? (
    <ArrowUpRightIcon size={16} weight="bold" aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  ) : null;

  if (r.external)
    return (
      <a href={r.href} target="_blank" rel="noopener noreferrer" className={cls} data-cta={isWa ? "whatsapp" : undefined}>
        {isWa && icon}
        <span>{label}</span>
        {!isWa && icon}
        {isWa && <span className="sr-only"> (abre WhatsApp)</span>}
      </a>
    );
  if (r.href.startsWith("#"))
    return (
      <a href={r.href} className={cls}>
        <span>{label}</span>
      </a>
    );
  return (
    <Link href={r.href} className={cls}>
      <span>{label}</span>
    </Link>
  );
}

export function SmartLink({ site, href, className, children }: { site: SiteData; href: string; className?: string; children: React.ReactNode }) {
  const r = resolveHref(href, site);
  if (r.external)
    return (
      <a href={r.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  if (r.href.startsWith("#")) return <a href={r.href} className={className}>{children}</a>;
  return <Link href={r.href} className={className}>{children}</Link>;
}
