"use client";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import type { SectionData } from "@/lib/schema";
import { Icon } from "../ui/Icon";

type Props = { section: Extract<SectionData, { type: "pipeline" }> };
type Section = Props["section"];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Proceso por etapas con ocho estilos, para que cada página tenga su propio movimiento:
 *  - track:    riel horizontal; una señal recorre las etapas en ciclo.
 *  - timeline: línea vertical que se llena con el scroll; etapas alternadas a cada lado.
 *  - stairs:   escalera ascendente; un marcador sube peldaño por peldaño.
 *  - circuit:  anillo de nodos; un cometa gira y el centro cuenta la etapa activa.
 *  - deck:     mazo de tarjetas; la de arriba se va y aparece la siguiente.
 *  - checklist: anillo de porcentaje y lista que se va marcando.
 *  - path:     camino serpenteante que se dibuja; un punto viaja de etapa en etapa.
 *  - tabs:     pestañas que avanzan solas (y se pueden tocar) con panel grande.
 * Sin JS o con movimiento reducido, todo queda encendido.
 */
export function Pipeline({ section: s }: Props) {
  return (
    <section id={s.id} className="section-y relative overflow-hidden bg-bg">
      <div aria-hidden className="blueprint absolute inset-0 opacity-60" />
      <div className="container-x relative">
        <div className="max-w-3xl">
          <h2 className="text-[clamp(2rem,4.4vw,3.4rem)] font-bold">{s.heading}</h2>
          {s.intro && <p className="mt-5 max-w-[60ch] text-lg text-ink-muted">{s.intro}</p>}
        </div>
        <Variant s={s} />
      </div>
    </section>
  );
}

function Variant({ s }: { s: Section }) {
  switch (s.variant) {
    case "timeline": return <Timeline s={s} />;
    case "stairs": return <Stairs s={s} />;
    case "circuit": return <Circuit s={s} />;
    case "deck": return <Deck s={s} />;
    case "checklist": return <Checklist s={s} />;
    case "path": return <Path s={s} />;
    case "tabs": return <Tabs s={s} />;
    default: return <Track s={s} />;
  }
}

/* ─────────── ciclo compartido: avanza mientras está en pantalla ─────────── */

function useCycle(total: number, ms: number): [RefObject<HTMLDivElement | null>, number, boolean, (n: number) => void] {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState(total - 1);
  const [visible, setVisible] = useState(false);
  const [nudge, setNudge] = useState(0); // reinicia el temporizador cuando el usuario elige una etapa
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !visible) return;
    if (!started.current) {
      started.current = true;
      setStep(0);
    }
    const id = setInterval(() => setStep((x) => (x + 1) % total), ms);
    return () => clearInterval(id);
  }, [reduce, visible, total, ms, nudge]);

  const jump = (i: number) => {
    setStep(i);
    setNudge((x) => x + 1);
  };

  return [ref, reduce ? total - 1 : step, reduce, jump];
}

function Result({ text, on }: { text: string; on: boolean }) {
  return (
    <motion.div
      animate={{ opacity: on ? 1 : 0.35, y: on ? 0 : 6, scale: on ? 1 : 0.98 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mt-10 flex w-fit items-center gap-3 rounded-pill border border-accent/60 bg-[color-mix(in_oklch,var(--c-accent)_10%,transparent)] py-2.5 pl-2.5 pr-5 text-[1rem] font-medium text-ink"
    >
      <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-ink">
        <CheckIcon size={16} weight="bold" aria-hidden />
      </span>
      {text}
    </motion.div>
  );
}

function Node({ icon, index, lit, now, reduce, size = "size-11" }: { icon?: Section["steps"][number]["icon"]; index: number; lit: boolean; now: boolean; reduce: boolean; size?: string }) {
  return (
    <motion.span
      animate={{ scale: now ? 1.12 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`relative z-10 grid ${size} shrink-0 place-items-center rounded-full border-2 transition-colors duration-500 ${
        lit ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink-muted"
      }`}
    >
      {now && !reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-accent"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      {icon ? <Icon name={icon} size={20} /> : <span className="font-display text-base font-bold">{index + 1}</span>}
    </motion.span>
  );
}

/* ─────────── 1. Pista horizontal ─────────── */

function Track({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce] = useCycle(n + 2, 1300);
  const active = Math.min(step, n - 1);
  const resultOn = step >= n;
  const progress = resultOn ? 1 : active / n + 0.012;

  return (
    <div ref={ref}>
      <div className="relative mt-14 md:mt-20">
        <div aria-hidden className="absolute left-[22px] top-0 h-full w-[2px] bg-line lg:left-0 lg:top-[22px] lg:h-[2px] lg:w-full" />
        <motion.div aria-hidden className="absolute left-[22px] top-0 h-full w-[2px] origin-top bg-accent lg:hidden" animate={{ scaleY: progress }} transition={{ duration: 0.9, ease: EASE }} />
        <motion.div aria-hidden className="absolute left-0 top-[22px] hidden h-[2px] w-full origin-left bg-accent lg:block" animate={{ scaleX: progress }} transition={{ duration: 0.9, ease: EASE }} />
        <ol className="relative grid gap-8 lg:[grid-template-columns:var(--cols)] lg:gap-6" style={{ "--cols": `repeat(${n}, minmax(0, 1fr))` } as CSSProperties}>
          {s.steps.map((st, i) => {
            const lit = i <= active || resultOn;
            const now = i === active && !resultOn;
            return (
              <li key={st.title} className="relative flex gap-5 lg:flex-col lg:gap-6">
                <Node icon={st.icon} index={i} lit={lit} now={now} reduce={reduce} />
                <div
                  className={`rounded-lg border p-5 transition-[border-color,background-color,transform] duration-500 lg:min-h-[10.5rem] ${
                    now ? "border-accent bg-[color-mix(in_oklch,var(--c-accent)_9%,var(--c-surface))] lg:-translate-y-1" : lit ? "border-line bg-surface" : "border-line/70 bg-surface/50"
                  }`}
                >
                  <h3 className={`text-lg font-bold transition-colors duration-500 ${lit ? "text-ink" : "text-ink-muted"}`}>{st.title}</h3>
                  {st.body && <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{st.body}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <Result text={s.result} on={resultOn} />
    </div>
  );
}

/* ─────────── 2. Línea de tiempo vertical ligada al scroll ─────────── */

function Timeline({ s }: { s: Section }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const endRef = useRef<HTMLDivElement>(null);
  const done = useInView(endRef, { once: false, amount: 1 });

  return (
    <div className="mt-14 md:mt-20">
      <div ref={wrap} className="relative">
        <div aria-hidden className="absolute bottom-0 left-[22px] top-0 w-[2px] bg-line lg:left-1/2 lg:-translate-x-1/2" />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-[22px] top-0 w-[2px] origin-top bg-accent lg:left-1/2 lg:-translate-x-1/2"
          style={{ scaleY: reduce ? 1 : fill }}
        />
        <ol className="relative space-y-10 lg:space-y-4">
          {s.steps.map((st, i) => (
            <TimelineRow key={st.title} st={st} index={i} reduce={reduce} />
          ))}
        </ol>
      </div>
      <div ref={endRef} className="lg:flex lg:justify-center">
        <Result text={s.result} on={reduce || done} />
      </div>
    </div>
  );
}

function TimelineRow({ st, index, reduce }: { st: Section["steps"][number]; index: number; reduce: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { amount: 0.6, margin: "0px 0px -20% 0px" });
  const lit = reduce || seen;
  const left = index % 2 === 0;
  return (
    <li ref={ref} className="relative grid grid-cols-[44px_1fr] items-center gap-5 lg:grid-cols-[1fr_56px_1fr] lg:gap-8">
      <div className={`hidden lg:block ${left ? "" : "lg:order-3"}`} aria-hidden />
      <div className="flex justify-center lg:order-2">
        <Node icon={st.icon} index={index} lit={lit} now={lit && !reduce} reduce={true} size="size-11 lg:size-14" />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, x: left ? 40 : -40 }}
        animate={lit ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`rounded-lg border p-6 transition-colors duration-500 ${left ? "lg:order-3" : "lg:order-1 lg:text-right"} ${
          lit ? "border-accent/60 bg-[color-mix(in_oklch,var(--c-accent)_7%,var(--c-surface))]" : "border-line bg-surface"
        }`}
      >
        <p className="text-xs font-medium tabular-nums text-accent-text">Paso {index + 1}</p>
        <h3 className="mt-1 text-xl font-bold">{st.title}</h3>
        {st.body && <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-muted">{st.body}</p>}
      </motion.div>
    </li>
  );
}

/* ─────────── 3. Escalera ascendente ─────────── */

function Stairs({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce] = useCycle(n + 2, 1250);
  const active = Math.min(step, n - 1);
  const resultOn = step >= n;

  return (
    <div ref={ref}>
      {/* escritorio: peldaños de altura creciente, alineados abajo */}
      <ol className="mt-14 hidden h-[27rem] items-end gap-4 lg:grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {s.steps.map((st, i) => {
          const lit = i <= active || resultOn;
          const now = i === active && !resultOn;
          const h = 52 + (i / Math.max(1, n - 1)) * 48; // 52 % → 100 %
          return (
            <li key={st.title} className="relative flex h-full flex-col justify-end">
              <div className="mb-3 flex h-14 items-end justify-center">
                {now && (
                  <motion.span layoutId={`climber-${s.heading}`} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_30px_-8px_var(--c-accent)]">
                    {st.icon ? <Icon name={st.icon} size={22} /> : <span className="font-bold">{i + 1}</span>}
                  </motion.span>
                )}
              </div>
              <motion.div
                initial={false}
                animate={{ height: `${h}%`, y: now ? -6 : 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className={`relative overflow-hidden rounded-t-lg border border-b-0 p-5 transition-colors duration-500 ${
                  now ? "border-accent bg-[color-mix(in_oklch,var(--c-accent)_12%,var(--c-surface))]" : lit ? "border-line bg-surface" : "border-line/60 bg-surface/40"
                }`}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 origin-bottom bg-[linear-gradient(to_top,color-mix(in_oklch,var(--c-accent)_22%,transparent),transparent)]"
                  initial={false}
                  animate={{ height: lit ? "60%" : "0%" }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
                <p className={`relative font-display text-3xl font-extrabold tabular-nums ${lit ? "text-accent-text" : "text-ink-muted/50"}`}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`relative mt-2 text-lg font-bold ${lit ? "text-ink" : "text-ink-muted"}`}>{st.title}</h3>
                {st.body && <p className="relative mt-2 text-[0.92rem] leading-relaxed text-ink-muted">{st.body}</p>}
              </motion.div>
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="hidden h-[2px] bg-line lg:block" />

      {/* móvil y tableta: peldaños con sangría creciente */}
      <ol className="mt-12 space-y-3 lg:hidden">
        {s.steps.map((st, i) => {
          const lit = i <= active || resultOn;
          const now = i === active && !resultOn;
          return (
            <li key={st.title} style={{ marginLeft: `${i * 6}%` }} className={`flex items-start gap-4 rounded-lg border p-4 transition-colors duration-500 ${now ? "border-accent bg-[color-mix(in_oklch,var(--c-accent)_10%,var(--c-surface))]" : "border-line bg-surface"}`}>
              <Node icon={st.icon} index={i} lit={lit} now={now} reduce={reduce} size="size-10" />
              <div>
                <h3 className="font-bold">{st.title}</h3>
                {st.body && <p className="mt-1 text-[0.92rem] text-ink-muted">{st.body}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <Result text={s.result} on={resultOn} />
    </div>
  );
}

/* ─────────── 4. Circuito circular ─────────── */

function Circuit({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce] = useCycle(n + 2, 1500);
  const active = Math.min(step, n - 1);
  const resultOn = step >= n;
  const cur = s.steps[active];
  const R = 43.75; // radio en % del contenedor (coincide con el anillo)
  const C = 2 * Math.PI * 140; // circunferencia del anillo SVG (r = 140 en viewBox 320)
  const frac = resultOn ? 1 : (active + 0.5) / n;

  return (
    <div ref={ref} className="mt-14 grid items-center gap-12 lg:grid-cols-2 md:mt-16">
      <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
        <svg viewBox="0 0 320 320" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="160" cy="160" r="140" fill="none" stroke="var(--c-border)" strokeWidth="2" strokeDasharray="3 7" />
          <motion.circle
            cx="160" cy="160" r="140" fill="none" stroke="var(--c-accent)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - frac) }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </svg>
        {/* cometa que gira hasta la etapa activa */}
        {!reduce && (
          <motion.div className="absolute inset-0" initial={false} animate={{ rotate: frac * 360 }} transition={{ duration: 0.9, ease: EASE }} aria-hidden>
            <span className="absolute left-1/2 top-[6.25%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_18px_4px_var(--c-accent)]" />
          </motion.div>
        )}
        {s.steps.map((st, i) => {
          const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
          const lit = i <= active || resultOn;
          const now = i === active && !resultOn;
          return (
            <span key={st.title} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}>
              <Node icon={st.icon} index={i} lit={lit} now={now} reduce={reduce} size="size-12" />
            </span>
          );
        })}
        <div className="absolute inset-[24%] grid place-items-center rounded-full border border-line bg-surface-2 text-center">
          <div className="px-4">
            <motion.p key={resultOn ? "ok" : active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-none text-accent-text tabular-nums">
              {resultOn ? <CheckIcon size={44} weight="bold" className="mx-auto" /> : String(active + 1).padStart(2, "0")}
            </motion.p>
            <p className="mt-2 text-sm font-semibold text-ink">{resultOn ? "Listo" : cur.title}</p>
          </div>
        </div>
      </div>

      <div>
        <ol className="space-y-2">
          {s.steps.map((st, i) => {
            const now = i === active && !resultOn;
            const lit = i <= active || resultOn;
            return (
              <li key={st.title} className={`relative overflow-hidden rounded-lg border px-5 py-4 transition-colors duration-500 ${now ? "border-accent bg-[color-mix(in_oklch,var(--c-accent)_9%,var(--c-surface))]" : "border-line bg-surface/60"}`}>
                {now && !reduce && (
                  <motion.span aria-hidden className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--c-accent)_16%,transparent),color-mix(in_oklch,var(--c-accent)_4%,transparent))]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "linear" }} />
                )}
                <div className="relative flex items-baseline gap-4">
                  <span className={`font-mono text-xs tabular-nums ${lit ? "text-accent-text" : "text-ink-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className={`font-bold ${lit ? "text-ink" : "text-ink-muted"}`}>{st.title}</h3>
                    {st.body && <p className="mt-1 text-[0.95rem] text-ink-muted">{st.body}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <Result text={s.result} on={resultOn} />
      </div>
    </div>
  );
}

/* ─────────── 5. Mazo de tarjetas ─────────── */

function Deck({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce, jump] = useCycle(n + 1, 1800);
  const resultOn = step >= n;
  const active = resultOn ? n - 1 : step;

  return (
    <div ref={ref} className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] md:mt-16">
      <div className="relative mx-auto h-[19rem] w-full max-w-xl">
        {s.steps.map((st, i) => {
          const pos = (i - active + n) % n; // 0 = arriba
          const hidden = pos > 2;
          return (
            <motion.article
              key={st.title}
              initial={false}
              animate={{
                y: pos * 22,
                scale: 1 - pos * 0.06,
                opacity: hidden ? 0 : 1 - pos * 0.25,
                rotate: pos === 0 ? 0 : pos % 2 ? 1.5 : -1.5,
                zIndex: n - pos,
              }}
              transition={{ duration: 0.6, ease: EASE }}
              className={`absolute inset-x-0 top-0 rounded-lg border p-8 shadow-[0_30px_60px_-30px_black] ${
                pos === 0 ? "border-accent bg-[color-mix(in_oklch,var(--c-accent)_8%,var(--c-surface-2))]" : "border-line bg-surface"
              }`}
              style={{ transformOrigin: "50% 0%" }}
              aria-hidden={pos !== 0}
            >
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-sm bg-accent text-accent-ink">
                  {st.icon ? <Icon name={st.icon} size={28} /> : <span className="font-bold">{i + 1}</span>}
                </span>
                <span className="font-mono text-sm tabular-nums text-ink-muted">
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(1.6rem,2.8vw,2.2rem)] font-bold">{st.title}</h3>
              {st.body && <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-muted">{st.body}</p>}
            </motion.article>
          );
        })}
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          {s.steps.map((st, i) => (
            <button
              key={st.title}
              type="button"
              onClick={() => jump(i)}
              className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                i === active && !resultOn ? "border-accent bg-accent text-accent-ink" : i < active || resultOn ? "border-accent/50 text-ink" : "border-line text-ink-muted hover:text-ink"
              }`}
            >
              {st.title}
            </button>
          ))}
        </div>
        {!reduce && (
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
            <motion.div className="h-full origin-left bg-accent" initial={false} animate={{ scaleX: resultOn ? 1 : (active + 1) / n }} transition={{ duration: 0.6, ease: EASE }} />
          </div>
        )}
        <Result text={s.result} on={resultOn} />
      </div>
    </div>
  );
}

/* ─────────── 6. Lista con anillo de avance ─────────── */

function Checklist({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce] = useCycle(n + 3, 1100);
  const done = Math.min(step, n); // etapas completas
  const resultOn = step >= n;
  const pct = Math.round((done / n) * 100);
  const C = 2 * Math.PI * 52;

  return (
    <div ref={ref} className="mt-14 grid items-center gap-12 md:mt-16 lg:grid-cols-[22rem_1fr]">
      <div className="relative mx-auto size-64 lg:size-72">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--c-border)" strokeWidth="6" />
          <motion.circle cx="60" cy="60" r="52" fill="none" stroke="var(--c-accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={false} animate={{ strokeDashoffset: C * (1 - done / n) }} transition={{ duration: 0.8, ease: EASE }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-6xl font-extrabold tabular-nums text-ink">
              {pct}
              <span className="text-3xl text-accent-text">%</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">{resultOn ? "Completado" : `${done} de ${n} listos`}</p>
          </div>
        </div>
        {resultOn && !reduce && (
          <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-accent" initial={{ scale: 0.9, opacity: 0.8 }} animate={{ scale: 1.25, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} />
        )}
      </div>
      <div>
        <ul className="space-y-3">
          {s.steps.map((st, i) => {
            const ok = i < done;
            const working = i === done && !resultOn;
            return (
              <li key={st.title} className={`flex items-start gap-4 rounded-lg border p-4 transition-colors duration-500 ${working ? "border-accent/70 bg-surface" : ok ? "border-line bg-surface" : "border-line/60 bg-surface/40"}`}>
                <span className="relative mt-0.5 grid size-8 shrink-0 place-items-center">
                  {ok ? (
                    <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="grid size-8 place-items-center rounded-full bg-accent text-accent-ink">
                      <CheckIcon size={16} weight="bold" aria-hidden />
                    </motion.span>
                  ) : working ? (
                    <span className="size-8 animate-spin rounded-full border-[3px] border-line border-t-accent" aria-hidden />
                  ) : (
                    <span className="size-8 rounded-full border-2 border-line" aria-hidden />
                  )}
                </span>
                <div>
                  <h3 className={`font-bold ${ok || working ? "text-ink" : "text-ink-muted"}`}>{st.title}</h3>
                  {st.body && <p className="mt-1 text-[0.95rem] text-ink-muted">{st.body}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <Result text={s.result} on={resultOn} />
      </div>
    </div>
  );
}

/* ─────────── 7. Camino serpenteante ─────────── */

function Path({ s }: { s: Section }) {
  const n = s.steps.length;
  const [ref, step, reduce] = useCycle(n + 2, 1350);
  const resultOn = step >= n;
  const active = Math.min(step, n - 1);
  // nodos en zigzag dentro de un lienzo 1000 × 300
  const pts = s.steps.map((_, i) => ({ x: 60 + (880 * i) / Math.max(1, n - 1), y: i % 2 ? 230 : 70 }));
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const q = pts[i - 1];
    const mx = (q.x + p.x) / 2;
    return `${acc} C${mx},${q.y} ${mx},${p.y} ${p.x},${p.y}`;
  }, "");
  const progress = resultOn ? 1 : active / Math.max(1, n - 1);

  return (
    <div ref={ref}>
      {/* escritorio */}
      <div className="relative mt-16 hidden lg:block" style={{ aspectRatio: "1000 / 300" }}>
        <svg viewBox="0 0 1000 300" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <path d={d} fill="none" stroke="var(--c-border)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
          <motion.path d={d} fill="none" stroke="var(--c-accent)" strokeWidth="3" strokeLinecap="round" initial={false} animate={{ pathLength: progress }} transition={{ duration: 1, ease: EASE }} />
        </svg>
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute z-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_24px_6px_var(--c-accent)]"
            initial={false}
            animate={{ left: `${pts[active].x / 10}%`, top: `${(pts[active].y / 300) * 100}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 16 }}
          />
        )}
        {s.steps.map((st, i) => {
          const lit = i <= active || resultOn;
          const now = i === active && !resultOn;
          const up = i % 2 === 0;
          return (
            <div key={st.title} className="absolute z-10 -translate-x-1/2" style={{ left: `${pts[i].x / 10}%`, top: `${(pts[i].y / 300) * 100}%` }}>
              <div className="-translate-y-1/2">
                <Node icon={st.icon} index={i} lit={lit} now={now} reduce={reduce} size="size-12" />
              </div>
              <motion.div
                initial={false}
                animate={{ opacity: lit ? 1 : 0.45, y: now ? (up ? -4 : 4) : 0 }}
                className={`absolute left-1/2 w-52 -translate-x-1/2 text-center ${up ? "bottom-[calc(100%+1.6rem)]" : "top-[calc(100%-0.2rem)]"}`}
              >
                <h3 className={`font-bold ${now ? "text-accent-text" : "text-ink"}`}>{st.title}</h3>
                {st.body && <p className="mt-1 text-[0.9rem] leading-snug text-ink-muted">{st.body}</p>}
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="hidden h-24 lg:block" aria-hidden />
      {/* móvil */}
      <ol className="mt-12 space-y-4 lg:hidden">
        {s.steps.map((st, i) => {
          const lit = i <= active || resultOn;
          const now = i === active && !resultOn;
          return (
            <li key={st.title} className={`flex items-start gap-4 ${i % 2 ? "pl-10" : ""}`}>
              <Node icon={st.icon} index={i} lit={lit} now={now} reduce={reduce} />
              <div>
                <h3 className="font-bold">{st.title}</h3>
                {st.body && <p className="mt-1 text-[0.95rem] text-ink-muted">{st.body}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <Result text={s.result} on={resultOn} />
    </div>
  );
}

/* ─────────── 8. Pestañas automáticas ─────────── */

function Tabs({ s }: { s: Section }) {
  const n = s.steps.length;
  const MS = 2600;
  const [ref, step, reduce, jump] = useCycle(n, MS);
  const active = step % n;
  const cur = s.steps[active];

  return (
    <div ref={ref} className="mt-14 grid gap-6 md:mt-16 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <div role="tablist" aria-label={s.heading} className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {s.steps.map((st, i) => {
          const on = i === active;
          return (
            <button
              key={st.title}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => jump(i)}
              className={`relative shrink-0 overflow-hidden rounded-lg border px-5 py-4 text-left transition-colors duration-300 ${on ? "border-accent bg-surface" : "border-line bg-surface/40 hover:bg-surface"}`}
            >
              {on && !reduce && (
                <motion.span key={`${active}-${step}`} aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: MS / 1000, ease: "linear" }} />
              )}
              <span className="flex items-center gap-3">
                <span className={`font-mono text-xs tabular-nums ${on ? "text-accent-text" : "text-ink-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`whitespace-nowrap font-semibold ${on ? "text-ink" : "text-ink-muted"}`}>{st.title}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="relative min-h-[18rem] overflow-hidden rounded-lg border border-line bg-surface p-8 md:p-12">
        <motion.div key={active} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <span className="grid size-16 place-items-center rounded-sm bg-accent text-accent-ink">{cur.icon ? <Icon name={cur.icon} size={32} /> : <span className="font-bold">{active + 1}</span>}</span>
          <p className="mt-8 font-mono text-sm tabular-nums text-ink-muted">
            Etapa {active + 1} de {n}
          </p>
          <h3 className="mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold">{cur.title}</h3>
          {cur.body && <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-muted">{cur.body}</p>}
        </motion.div>
        <span
          aria-hidden
          data-n={String(active + 1).padStart(2, "0")}
          className="pointer-events-none absolute -bottom-10 -right-4 select-none font-display text-[12rem] font-extrabold leading-none text-line/50 after:content-[attr(data-n)]"
        />
        <div className="relative mt-8 flex items-center gap-3 text-[0.95rem] text-ink">
          <CheckIcon size={18} weight="bold" className="text-accent" aria-hidden />
          {s.result}
        </div>
      </div>
    </div>
  );
}
