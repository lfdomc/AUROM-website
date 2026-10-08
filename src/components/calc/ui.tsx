"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, FilePdfIcon, LinkSimpleIcon, SpinnerGapIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { miles, VIGENCIA } from "@/lib/planilla";
import { track } from "@/lib/track";
import { rowValue, sharePdf, totalValue, whatsappShareUrl, whatsappText, type Report } from "./report";

/* ─────────────────  Contexto de la página  ───────────────── */

export type CalcCtx = {
  kind: string;
  pageUrl: string;
  slug: string;
  lead: string;
  leadHref: string;
  leadLabel: string;
  brand: { name: string; tagline: string; site: string; whatsapp: string };
};
const Ctx = createContext<CalcCtx | null>(null);
export const CalcProvider = Ctx.Provider;
export const useCalc = () => useContext(Ctx)!;

/* ─────────────────  Controles  ───────────────── */

const parse = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.92rem] font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-[0.82rem] text-ink-muted">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "h-12 w-full rounded-sm border border-line bg-bg px-4 text-[1.05rem] text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--c-accent)_30%,transparent)]";

export function Money({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">₡</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className={`${inputCls} pl-8 font-mono`}
          value={value ? miles(value) : ""}
          placeholder="0"
          onChange={(e) => onChange(parse(e.target.value))}
        />
      </div>
    </Field>
  );
}

export function Num({ label, hint, value, onChange, max = 999, step = 1, suffix }: { label: string; hint?: string; value: number; onChange: (n: number) => void; max?: number; step?: number; suffix?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={step}
          className={`${inputCls} font-mono ${suffix ? "pr-16" : ""}`}
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.9rem] text-ink-muted">{suffix}</span>}
      </div>
    </Field>
  );
}

export function DateIn({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} type="date" className={`${inputCls} font-mono`} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select({ label, hint, value, onChange, options }: { label: string; hint?: string; value: number; onChange: (n: number) => void; options: string[] }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className={`${inputCls} cursor-pointer`} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o, i) => (
          <option key={i} value={i}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[0.95rem]">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-11 shrink-0 rounded-pill bg-surface-2 ring-1 ring-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5 peer-checked:after:bg-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
      {label}
    </label>
  );
}

export function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-[0.92rem] font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-pill border px-4 text-[0.92rem] font-semibold transition-colors ${
              o.value === value ? "border-accent bg-accent text-accent-ink" : "border-line text-ink hover:border-ink-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Layout({ form, report, query }: { form: ReactNode; report: Report; query: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form className="grid content-start gap-6 rounded-lg border border-line bg-surface p-6 md:p-8 lg:col-span-7" onSubmit={(e) => e.preventDefault()}>
        {form}
      </form>
      <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <ResultCard report={report} query={query} />
      </div>
    </div>
  );
}

/* ─────────────────  Resultado + compartir  ───────────────── */

export function ResultCard({ report: r, query }: { report: Report; query?: string }) {
  const reduce = useReducedMotion();
  const ctx = useCalc();
  return (
    <div className="flex flex-col rounded-lg bg-ink p-6 text-bg md:p-8" aria-live="polite">
      <p className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-accent">{r.label}</p>
      <p className="mt-2 text-[0.95rem] opacity-70">{r.totalLabel}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={totalValue(r)}
          initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2rem,5vw,3.2rem)] font-bold tabular-nums leading-tight"
        >
          {totalValue(r)}
        </motion.p>
      </AnimatePresence>
      <dl className="mt-6 grid border-t border-bg/15">
        {r.rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-bg/10 py-3">
            <dt className="text-[0.95rem] opacity-80">
              {row.label}
              {row.note && <span className="block text-[0.8rem] opacity-60">{row.note}</span>}
            </dt>
            <dd className={`shrink-0 font-mono text-[0.98rem] tabular-nums ${row.sign === "-" && row.value ? "text-[#ff9b8a]" : ""}`}>{rowValue(row)}</dd>
          </div>
        ))}
      </dl>
      {r.extras?.map((e) => (
        <p key={e} className="mt-4 text-[0.95rem]">
          {e}
        </p>
      ))}
      <Share report={r} url={`${ctx.pageUrl}${query ? `?${query}` : ""}`} />
      <p className="mt-5 text-[0.8rem] opacity-60">Cálculo de referencia con las reglas {VIGENCIA}. No sustituye una asesoría legal o contable.</p>
      <div className="mt-5 rounded-sm border border-bg/15 p-4">
        <p className="text-[0.92rem] opacity-90">{ctx.lead}</p>
        <a
          href={ctx.leadHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("calculator_lead", { calculator: ctx.kind })}
          className="mt-2 inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-accent underline-offset-4 hover:underline"
        >
          <WhatsappLogoIcon size={17} weight="bold" aria-hidden />
          {ctx.leadLabel}
        </a>
      </div>
    </div>
  );
}

function Share({ report, url }: { report: Report; url: string }) {
  const ctx = useCalc();
  const [pdf, setPdf] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const btn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-[0.92rem] font-semibold transition-[background-color,transform] active:scale-[0.97]";

  return (
    <div className="mt-6 grid gap-2.5">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] opacity-60">Guardar o enviar el resultado</p>
      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={whatsappShareUrl(whatsappText(report, url, `${ctx.brand.name} (${ctx.brand.site})`))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("calculator_share", { calculator: ctx.kind, method: "whatsapp" })}
          className={`${btn} bg-[#25d366] text-[#0b2e17] hover:bg-[#3ee07a]`}
        >
          <WhatsappLogoIcon size={19} weight="bold" aria-hidden />
          WhatsApp
        </a>
        <button
          type="button"
          disabled={pdf === "busy"}
          onClick={async () => {
            setPdf("busy");
            try {
              await sharePdf(report, url, ctx.brand, `${ctx.slug.split("/").pop()}-${new Date().toISOString().slice(0, 10)}.pdf`);
              track("calculator_share", { calculator: ctx.kind, method: "pdf" });
              setPdf("done");
              setTimeout(() => setPdf("idle"), 2500);
            } catch {
              setPdf("error");
            }
          }}
          className={`${btn} bg-bg text-ink hover:bg-[color-mix(in_oklch,var(--c-bg)_85%,white)]`}
        >
          {pdf === "busy" ? <SpinnerGapIcon size={19} className="animate-spin" aria-hidden /> : pdf === "done" ? <CheckIcon size={19} weight="bold" aria-hidden /> : <FilePdfIcon size={19} weight="bold" aria-hidden />}
          {pdf === "busy" ? "Generando…" : pdf === "done" ? "Listo" : pdf === "error" ? "Reintentar" : "PDF"}
        </button>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            track("calculator_share", { calculator: ctx.kind, method: "link" });
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* sin permiso de portapapeles */
          }
        }}
        className="inline-flex items-center justify-center gap-1.5 py-1 text-[0.85rem] opacity-70 transition-opacity hover:opacity-100"
      >
        {copied ? <CheckIcon size={15} weight="bold" aria-hidden /> : <LinkSimpleIcon size={15} weight="bold" aria-hidden />}
        {copied ? "Enlace copiado" : "Copiar enlace con estos datos"}
      </button>
    </div>
  );
}

