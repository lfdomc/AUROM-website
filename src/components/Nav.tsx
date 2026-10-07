"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useReducedMotion } from "motion/react";
import { ListIcon, XIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./ui/Logo";

type Item = { label: string; href: string; external?: boolean };

export function Nav({ logoText, items, cta }: { logoText: string; items: Item[]; cta: Item }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const down = y > last.current && y > 240;
    last.current = y;
    if (down !== hidden && !open) setHidden(down);
    const s = y > 24;
    if (s !== scrolled) setScrolled(s);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden && !reduce ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto mt-3 flex h-16 max-w-[78rem] items-center justify-between gap-6 rounded-pill border px-3 pl-5 transition-[background-color,border-color,backdrop-filter] duration-300 md:mx-6 xl:mx-auto mx-3 ${
          scrolled || open
            ? "border-line bg-[color-mix(in_oklch,var(--c-bg)_82%,transparent)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link href="/" aria-label={`${logoText}, inicio`} onClick={() => setOpen(false)}>
          <Logo text={logoText} />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="rounded-pill px-4 py-2 text-[0.95rem] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="whatsapp"
            className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-pill bg-accent px-5 text-[0.95rem] font-semibold text-accent-ink transition-transform active:scale-[0.97] sm:inline-flex"
          >
            <WhatsappLogoIcon size={18} weight="bold" aria-hidden />
            {cta.label}
          </a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-pill border border-line text-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-movil"
            aria-label="Menú móvil"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-3 mt-2 rounded-lg border border-line bg-bg p-3 md:hidden"
          >
            <ul className="flex flex-col">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-sm px-4 py-3.5 font-display text-2xl font-semibold text-ink"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp"
              className="mt-3 flex h-13 items-center justify-center gap-2 rounded-pill bg-accent font-semibold text-accent-ink"
            >
              <WhatsappLogoIcon size={19} weight="bold" aria-hidden />
              {cta.label}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
