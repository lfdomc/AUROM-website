"use client";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { VisualName } from "@/lib/schema";
import {
  BellIcon, CheckCircleIcon, CheckIcon, FileTextIcon, HouseIcon, MagnifyingGlassIcon, PaperPlaneTiltIcon, WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

/*
 * Ilustraciones animadas de cada solución. Cada una es un pequeño ciclo que se repite
 * mientras está en pantalla (como el diagrama del inicio), se pausa fuera de ella y,
 * con movimiento reducido, muestra directamente el estado final.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Avanza un paso cada `ms` mientras el elemento esté visible. Devuelve [ref, paso]. */
function useLoop(total: number, ms: number): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // El HTML del servidor muestra el estado final (completo para Google y sin JS);
  // al entrar en pantalla el ciclo arranca desde el inicio.
  const [step, setStep] = useState(total - 1);
  const [visible, setVisible] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !visible) return;
    if (!started.current) {
      started.current = true;
      setStep(0);
    }
    const id = setInterval(() => setStep((s) => (s + 1) % total), ms);
    return () => clearInterval(id);
  }, [reduce, visible, total, ms]);

  return [ref, reduce ? total - 1 : step];
}

function Frame({
  title,
  children,
  live,
  frameRef,
  note = "Ejemplo ilustrativo",
}: {
  title: string;
  children: ReactNode;
  live?: string;
  frameRef?: RefObject<HTMLDivElement | null>;
  note?: string;
}) {
  return (
    <div
      ref={frameRef}
      className="relative overflow-hidden rounded-lg border border-line bg-surface-2 shadow-[0_30px_80px_-40px_color-mix(in_oklch,var(--c-bg)_80%,black)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {title}
        </span>
        <span className="truncate text-[11px] text-ink-muted">{live ?? note}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const crc = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ml-auto flex w-fit items-center gap-1 rounded-[16px] rounded-br-[4px] bg-[color-mix(in_oklch,var(--c-accent)_22%,var(--c-surface))] px-3.5 py-3"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-accent"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  );
}

function Bubble({ who, children, words }: { who: "guest" | "bot" | "system"; children?: ReactNode; words?: string }) {
  if (who === "system")
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-auto flex w-fit items-center gap-1.5 rounded-pill border border-accent/50 bg-[color-mix(in_oklch,var(--c-accent)_10%,transparent)] px-3 py-1.5 text-[11.5px] text-ink"
      >
        <BellIcon size={13} weight="bold" aria-hidden className="text-accent" />
        {children}
      </motion.div>
    );
  const isGuest = who === "guest";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, x: isGuest ? -8 : 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`max-w-[86%] rounded-[16px] px-3.5 py-2.5 text-[13px] leading-snug ${
        isGuest ? "rounded-bl-[4px] bg-surface text-ink" : "ml-auto rounded-br-[4px] bg-accent text-accent-ink"
      }`}
    >
      {words ? (
        <motion.span initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: 0.035 } } }}>
          {words.split(" ").map((w, i) => (
            <motion.span key={i} variants={{ h: { opacity: 0 }, s: { opacity: 1 } }}>
              {w}{" "}
            </motion.span>
          ))}
        </motion.span>
      ) : (
        children
      )}
    </motion.div>
  );
}

/* ─────────────── Planilla: filas que se calculan una a una ─────────────── */

function Payroll() {
  const rows = [
    { role: "Maestro de obras", gross: 620000 },
    { role: "Operario", gross: 410000 },
    { role: "Bodeguero", gross: 395000 },
    { role: "Asistente administrativa", gross: 480000 },
  ];
  // 0 → nada calculado · 1..4 filas · 5 comprobantes · 6 espera
  const [ref, step] = useLoop(8, 900);
  const done = Math.min(step, rows.length);
  const sent = step >= 5;

  return (
    <Frame frameRef={ref} title="Planilla quincenal" live={sent ? "Planilla cerrada" : `Calculando ${done}/${rows.length}`}>
      <div className="grid grid-cols-[1.5fr_1fr_0.9fr_1fr] gap-x-2 border-b border-line pb-2 text-[11px] font-semibold text-ink-muted">
        <span>Puesto</span>
        <span className="text-right">Bruto</span>
        <span className="text-right">CCSS</span>
        <span className="text-right">Neto</span>
      </div>
      <ul>
        {rows.map((r, i) => {
          const calculated = i < done;
          const working = i === done && step < 5;
          const ccss = r.gross * 0.1067;
          return (
            <li
              key={r.role}
              className={`relative grid grid-cols-[1.5fr_1fr_0.9fr_1fr] items-center gap-x-2 border-b border-line/60 py-2.5 text-[12.5px] tabular-nums transition-colors duration-300 ${
                working ? "bg-[color-mix(in_oklch,var(--c-accent)_8%,transparent)]" : ""
              }`}
            >
              {working && (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                  layoutId="payroll-cursor"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="truncate pl-2 text-ink">{r.role}</span>
              <span className="text-right text-ink-muted">{crc(r.gross)}</span>
              <Cell show={calculated} working={working} value={crc(ccss)} />
              <Cell show={calculated} working={working} value={crc(r.gross - ccss)} strong />
            </li>
          );
        })}
      </ul>
      <div className="mt-4 h-11">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex h-full items-center gap-2 rounded-sm bg-[color-mix(in_oklch,var(--c-accent)_14%,transparent)] px-3 text-[13px] text-ink"
            >
              <CheckCircleIcon size={18} weight="fill" className="text-accent" aria-hidden />
              Planilla calculada y 4 comprobantes enviados
            </motion.div>
          ) : (
            <motion.div key="bar" exit={{ opacity: 0 }} className="flex h-full items-center gap-3 px-1 text-[12px] text-ink-muted">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                <motion.span
                  className="block h-full origin-left rounded-full bg-accent"
                  animate={{ scaleX: done / rows.length }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </span>
              <span className="tabular-nums">{Math.round((done / rows.length) * 100)} %</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function Cell({ show, working, value, strong }: { show: boolean; working: boolean; value: string; strong?: boolean }) {
  return (
    <span className={`text-right ${strong ? "text-ink" : "text-ink-muted"}`}>
      <AnimatePresence mode="wait" initial={false}>
        {show ? (
          <motion.span key="v" className="inline-block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            {value}
          </motion.span>
        ) : working ? (
          <motion.span
            key="w"
            className="ml-auto block h-3 w-14 rounded bg-[linear-gradient(90deg,var(--c-surface),color-mix(in_oklch,var(--c-accent)_35%,var(--c-surface)),var(--c-surface))] bg-[length:200%_100%]"
            animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          />
        ) : (
          <motion.span key="e" className="text-line" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
            —
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ─────────────── Conversaciones (Airbnb y asistente) ─────────────── */

type Msg = { who: "guest" | "bot" | "system" | "typing"; text: string; stream?: boolean };

function Conversation({ title, script, footer, ms = 1200, minH = "min-h-[15.5rem]" }: { title: string; script: Msg[]; footer: ReactNode; ms?: number; minH?: string }) {
  // paso 0 vacío · 1 mensaje por paso · 2 pasos de espera con la conversación completa
  const [ref, step] = useLoop(script.length + 3, ms);
  const shown = script.slice(0, Math.min(step, script.length)).filter((m, i, arr) => m.who !== "typing" || i === arr.length - 1);
  const clearing = step === 0;

  return (
    <Frame frameRef={ref} title={title} live={step >= 1 && step <= script.length && script[step - 1]?.who === "typing" ? "Escribiendo…" : "En línea"}>
      <div className={`flex flex-col justify-end gap-2.5 ${minH}`}>
        <AnimatePresence mode="popLayout">
          {!clearing &&
            shown.map((m, i) =>
              m.who === "typing" ? (
                <TypingDots key={`t${i}`} />
              ) : (
                <Bubble key={`${m.who}${i}`} who={m.who} words={m.stream ? m.text : undefined}>
                  {m.text}
                </Bubble>
              ),
            )}
        </AnimatePresence>
      </div>
      <div className="mt-4 border-t border-line pt-3">{footer}</div>
    </Frame>
  );
}

function Airbnb() {
  return (
    <Conversation
      title="Casa Montaña · mensajes"
      script={[
        { who: "guest", text: "Hi! What's the wifi password?" },
        { who: "typing", text: "" },
        { who: "bot", text: "Hi Laura! Network: CasaMontana_5G. The password is on the card by the door.", stream: true },
        { who: "guest", text: "¿Podemos llegar antes de las 3?" },
        { who: "system", text: "Solicitud especial enviada al anfitrión" },
      ]}
      footer={
        <span className="flex items-center gap-2 text-[12px] text-ink-muted">
          <HouseIcon size={15} weight="duotone" aria-hidden className="text-accent" />
          Información propia de cada propiedad · responde 24/7
        </span>
      }
    />
  );
}

function Assistant() {
  return (
    <Conversation
      title="Asistente de la empresa"
      ms={1300}
      minH="min-h-[13.5rem]"
      script={[
        { who: "guest", text: "¿Cuál es la garantía del calentador de 40 galones?" },
        { who: "typing", text: "" },
        { who: "bot", text: "Tiene 12 meses de garantía desde la fecha de compra, presentando la factura.", stream: true },
        { who: "system", text: "Fuente: Política de garantías, pág. 4" },
      ]}
      footer={
        <span className="flex items-center gap-2 text-[12px] text-ink-muted">
          <WhatsappLogoIcon size={15} weight="duotone" aria-hidden className="text-accent" />
          Disponible por WhatsApp y en el sitio web
          <FileTextIcon size={15} weight="duotone" aria-hidden className="ml-auto text-accent" />
        </span>
      }
    />
  );
}

/* ─────────────── SICOP: escaneo, coincidencias y alerta ─────────────── */

function Sicop() {
  const items = [
    { t: "Construcción de aceras y cordón de caño", tag: "obra civil", days: 9 },
    { t: "Suministro de materiales de construcción", tag: "materiales", days: 6 },
    { t: "Mantenimiento de edificio administrativo", tag: "mantenimiento", days: 12 },
  ];
  // 0 escaneando · 1..3 coincidencias · 4 alerta · 5-6 espera
  const [ref, step] = useLoop(7, 1100);
  const found = Math.min(Math.max(step, 0), items.length);
  const alert = step >= 4;
  const [count, setCount] = useState(0);
  useEffect(() => {
    const to = step === 0 ? 0 : 62 + step * 41;
    const c = animate(step === 0 ? 0 : 62 + (step - 1) * 41, to, { duration: 0.9, onUpdate: (n) => setCount(Math.round(n)) });
    return () => c.stop();
  }, [step]);

  return (
    <Frame frameRef={ref} title="Monitoreo de SICOP" live={`${count} concursos revisados hoy`}>
      <div className="relative mb-3 flex items-center gap-2 overflow-hidden rounded-sm border border-line px-3 py-2 text-[12px] text-ink-muted">
        <MagnifyingGlassIcon size={14} weight="bold" aria-hidden />
        obra civil, materiales, mantenimiento
        {!alert && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-16 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--c-accent)_30%,transparent),transparent)]"
            animate={{ left: ["-20%", "110%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
      <ul className="min-h-[12.6rem] space-y-2">
        <AnimatePresence initial={false}>
          {items.slice(0, found).map((it, i) => (
            <motion.li
              key={it.t}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`rounded-sm px-3.5 py-2.5 transition-colors duration-700 ${i === found - 1 && !alert ? "bg-[color-mix(in_oklch,var(--c-accent)_12%,var(--c-surface))]" : "bg-surface"}`}
            >
              <p className="flex items-start justify-between gap-3 text-[13px] font-medium leading-snug text-ink">
                {it.t}
                {i === found - 1 && !alert && <span className="shrink-0 rounded-pill bg-accent px-2 py-0.5 text-[10.5px] font-semibold text-accent-ink">Nuevo</span>}
              </p>
              <p className="mt-1 flex items-center gap-3 text-[11.5px] text-ink-muted">
                <span className="text-accent-text">Coincide: {it.tag}</span>
                <span>Cierra en {it.days} días</span>
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-3 h-6">
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex items-center gap-2 text-[12px] text-ink"
            >
              <PaperPlaneTiltIcon size={15} weight="fill" aria-hidden className="text-accent" />
              Alerta enviada al equipo de licitaciones
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ─────────────── Presupuesto: la obra se construye mientras suma ─────────────── */

const PARTIDAS = [
  { p: "Obras preliminares", amount: 2_400_000 },
  { p: "Fundaciones", amount: 7_800_000 },
  { p: "Paredes", amount: 10_500_000 },
  { p: "Techo", amount: 7_200_000 },
  { p: "Acabados", amount: 9_100_000 },
  { p: "Instalaciones", amount: 6_000_000 },
];

function Budget() {
  // 0 terreno · 1..6 partidas · 7-8 terminado
  const [ref, step] = useLoop(9, 1050);
  const stage = Math.min(step, PARTIDAS.length); // partidas completas
  const total = PARTIDAS.slice(0, stage).reduce((a, b) => a + b.amount, 0);
  const [shownTotal, setShownTotal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const c = animate(prev.current, total, { duration: 0.8, ease: EASE, onUpdate: (n) => setShownTotal(n) });
    prev.current = total;
    return () => c.stop();
  }, [total]);
  const finished = step >= 7;

  return (
    <Frame frameRef={ref} title="Presupuesto en construcción" live={finished ? "Presupuesto listo" : `Partida ${Math.max(stage, 1)} de ${PARTIDAS.length}`}>
      <Building stage={stage} finished={finished} />
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PARTIDAS.map((r, i) => {
          const done = i < stage;
          const current = i === stage - 1 && !finished;
          return (
            <li key={r.p} className={`flex items-center gap-2 text-[12.5px] transition-colors duration-300 ${done ? "text-ink" : "text-ink-muted/60"}`}>
              <span className={`grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${done ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>
                {done && <CheckIcon size={10} weight="bold" aria-hidden />}
              </span>
              <span className={current ? "font-semibold" : ""}>{r.p}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
        <span className="text-[12px] text-ink-muted">Costo directo acumulado</span>
        <span className="font-display text-xl font-bold tabular-nums text-ink">{crc(shownTotal)}</span>
      </div>
    </Frame>
  );
}

/** Casa en línea de plano que se levanta por etapas: preliminares, fundación, paredes, techo, acabados, instalaciones. */
function Building({ stage, finished }: { stage: number; finished: boolean }) {
  const t = { duration: 0.7, ease: EASE };
  const show = (n: number) => ({ opacity: stage >= n ? 1 : 0 });
  return (
    <div className="relative overflow-hidden rounded-sm border border-line bg-[color-mix(in_oklch,var(--c-bg)_60%,var(--c-surface))]">
      <svg viewBox="0 0 320 150" className="block h-auto w-full" aria-hidden>
        {/* retícula de plano */}
        <defs>
          <pattern id="grid-b" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="var(--c-border)" strokeWidth="0.5" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="320" height="150" fill="url(#grid-b)" />
        {/* terreno */}
        <line x1="20" y1="128" x2="300" y2="128" stroke="var(--c-ink-muted)" strokeWidth="1.2" />
        {/* 1 · preliminares: estacas y trazo */}
        <motion.g initial={false} animate={show(1)} transition={t}>
          {[70, 250].map((x) => (
            <line key={x} x1={x} y1="118" x2={x} y2="132" stroke="var(--c-accent)" strokeWidth="2" />
          ))}
          <line x1="70" y1="121" x2="250" y2="121" stroke="var(--c-accent)" strokeWidth="1" strokeDasharray="3 4" />
        </motion.g>
        {/* 2 · fundaciones */}
        <motion.rect x="76" y="118" width="168" height="10" fill="var(--c-ink-muted)" initial={false}
          animate={{ scaleX: stage >= 2 ? 1 : 0 }} style={{ transformOrigin: "160px 123px" }} transition={t} />
        {/* 3 · paredes: bloques que suben */}
        <motion.g initial={false} animate={{ scaleY: stage >= 3 ? 1 : 0 }} style={{ transformOrigin: "160px 118px" }} transition={{ ...t, duration: 0.9 }}>
          <rect x="84" y="66" width="152" height="52" fill="var(--c-surface-2)" stroke="var(--c-ink)" strokeWidth="1.4" />
          {[0, 1, 2, 3].map((r) => (
            <line key={r} x1="84" y1={79 + r * 13} x2="236" y2={79 + r * 13} stroke="var(--c-border)" strokeWidth="0.8" />
          ))}
          {[0, 1, 2, 3].map((r) =>
            Array.from({ length: 6 }, (_, c) => (
              <line key={`${r}-${c}`} x1={96 + c * 25 + (r % 2) * 12} y1={66 + r * 13} x2={96 + c * 25 + (r % 2) * 12} y2={79 + r * 13} stroke="var(--c-border)" strokeWidth="0.8" />
            )),
          )}
        </motion.g>
        {/* 4 · techo: baja desde arriba */}
        <motion.path d="M74 68 L160 26 L246 68 Z" fill="var(--c-surface)" stroke="var(--c-ink)" strokeWidth="1.4" strokeLinejoin="round"
          initial={false} animate={{ opacity: stage >= 4 ? 1 : 0, y: stage >= 4 ? 0 : -24 }} transition={t} />
        {/* 5 · acabados: puerta y ventanas */}
        <motion.g initial={false} animate={show(5)} transition={t}>
          <rect x="146" y="88" width="28" height="30" rx="1.5" fill="var(--c-accent)" opacity="0.85" />
          <rect x="102" y="80" width="28" height="20" fill="var(--c-bg)" stroke="var(--c-ink)" strokeWidth="1.2" />
          <rect x="190" y="80" width="28" height="20" fill="var(--c-bg)" stroke="var(--c-ink)" strokeWidth="1.2" />
        </motion.g>
        {/* 6 · instalaciones: luz encendida y acometida */}
        <motion.g initial={false} animate={show(6)} transition={t}>
          <rect x="103" y="81" width="26" height="18" fill="var(--c-accent)" opacity="0.55" />
          <rect x="191" y="81" width="26" height="18" fill="var(--c-accent)" opacity="0.55" />
          <path d="M246 60 L276 60 L276 30" fill="none" stroke="var(--c-accent)" strokeWidth="1.4" strokeDasharray="3 3" />
          <circle cx="276" cy="28" r="3" fill="var(--c-accent)" />
        </motion.g>
        {/* grúa simple que acompaña la obra mientras se construye */}
        <motion.g initial={false} animate={{ opacity: finished ? 0 : 1 }} transition={t}>
          <line x1="40" y1="128" x2="40" y2="20" stroke="var(--c-ink-muted)" strokeWidth="1.6" />
          <line x1="30" y1="22" x2="150" y2="22" stroke="var(--c-ink-muted)" strokeWidth="1.6" />
          <motion.g animate={{ x: [0, 60, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
            <line x1="80" y1="22" x2="80" y2="44" stroke="var(--c-ink-muted)" strokeWidth="1" />
            <rect x="74" y="44" width="12" height="7" fill="var(--c-accent)" />
          </motion.g>
        </motion.g>
      </svg>
      <AnimatePresence>
        {finished && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-pill bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-ink"
          >
            <CheckIcon size={11} weight="bold" aria-hidden />
            PDF · Excel
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Tablero: datos que se actualizan solos ─────────────── */

const SETS = [
  { bars: [42, 55, 48, 63, 70, 82], margin: 31, growth: 12 },
  { bars: [46, 52, 58, 61, 74, 79], margin: 33, growth: 9 },
  { bars: [40, 57, 51, 66, 68, 88], margin: 34, growth: 15 },
];
const MONTHS = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];

function Data() {
  const [ref, step] = useLoop(SETS.length, 2600);
  const d = SETS[step];
  return (
    <Frame frameRef={ref} title="Tablero de dirección" live="Actualizado hace 1 min">
      <div className="grid grid-cols-2 gap-2.5">
        <Kpi label="Margen bruto" value={d.margin} suffix=" %" />
        <Kpi label="Ventas vs. mes anterior" value={d.growth} prefix="+" suffix=" %" />
      </div>
      <div className="relative mt-4 flex h-36 items-end gap-2.5" aria-hidden>
        {[25, 50, 75].map((g) => (
          <span key={g} className="absolute inset-x-0 border-t border-dashed border-line/70" style={{ bottom: `calc(${g}% * 0.82 + 18px)` }} />
        ))}
        {d.bars.map((b, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <motion.div
              className={`w-full rounded-t-[4px] ${i === d.bars.length - 1 ? "bg-accent" : "bg-[color-mix(in_oklch,var(--c-ink-muted)_45%,transparent)]"}`}
              initial={false}
              animate={{ height: `${b * 0.82}%` }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: EASE }}
            />
            <span className="text-[10.5px] text-ink-muted">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Kpi({ label, value, prefix = "", suffix = "" }: { label: string; value: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.9, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return (
    <div className="rounded-sm bg-surface px-3 py-2.5">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="font-display text-xl font-bold tabular-nums text-ink">
        {prefix}
        {n}
        {suffix}
      </p>
    </div>
  );
}

/* ─────────────── Equipos y mantenimiento: cronograma, orden de trabajo y repuesto ─────────────── */

const EQUIPOS = [
  { name: "Compresor de aire", sn: "SN 4471-B" },
  { name: "Generador eléctrico", sn: "SN 0932-A" },
  { name: "Bomba de agua", sn: "SN 1188-C" },
];

function Maintenance() {
  // 0 aviso · 1 orden de trabajo · 2 técnico asignado · 3 repuesto usado · 4 al día · 5 espera
  const [ref, step] = useLoop(6, 1150);
  const week = ["L", "K", "M", "J", "V", "S", "D"];
  const today = Math.min(step, 4);
  const done = step >= 4;
  const log = [
    { at: 1, text: "Orden de trabajo OT-0142 creada" },
    { at: 2, text: "Asignada a técnico de mantenimiento" },
    { at: 3, text: "Repuesto: filtro de aire (quedan 4)" },
  ];

  return (
    <Frame frameRef={ref} title="Equipos y mantenimiento" live={done ? "Mantenimiento completado" : "Cronograma preventivo"}>
      <ul className="space-y-2">
        {EQUIPOS.map((e, i) => {
          const active = i === 0;
          return (
            <li
              key={e.sn}
              className={`flex items-center justify-between gap-3 rounded-sm px-3.5 py-2.5 transition-colors duration-500 ${
                active && !done ? "bg-[color-mix(in_oklch,var(--c-accent)_12%,var(--c-surface))]" : "bg-surface"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{e.name}</span>
                <span className="font-mono text-[11px] text-ink-muted">{e.sn}</span>
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active ? (done ? "ok" : "due") : "ok"}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${
                    active && !done ? "bg-accent text-accent-ink" : "border border-line text-ink-muted"
                  }`}
                >
                  {active && !done ? "Toca mantenimiento" : i === 1 ? "Próximo en 18 días" : i === 2 ? "Próximo en 32 días" : "Al día"}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden>
        {week.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-1">
            <span className="text-[10.5px] text-ink-muted">{d}</span>
            <span className={`relative grid h-7 w-full place-items-center rounded-[6px] text-[11px] tabular-nums ${i === today ? "bg-accent text-accent-ink font-semibold" : "bg-surface text-ink-muted"}`}>
              {12 + i}
              {i === 4 && <span className="absolute -bottom-1 size-1.5 rounded-full bg-accent ring-2 ring-surface-2" />}
            </span>
          </div>
        ))}
      </div>

      <ul className="mt-4 min-h-[5.6rem] space-y-1.5 border-t border-line pt-3">
        <AnimatePresence initial={false}>
          {log
            .filter((l) => step >= l.at)
            .map((l) => (
              <motion.li
                key={l.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex items-center gap-2 text-[12px] text-ink"
              >
                <CheckIcon size={12} weight="bold" aria-hidden className="text-accent" />
                {l.text}
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
    </Frame>
  );
}

/* ─────────────── Correos: lectura, clasificación y envío al flujo correcto ─────────────── */

const CORREOS = [
  { from: "Proveedor", subject: "Factura electrónica FE-00123", tag: "Factura", to: "Contabilidad" },
  { from: "Cliente", subject: "Solicitud de cotización", tag: "Cotización", to: "Ventas" },
  { from: "Cliente", subject: "El equipo no enciende", tag: "Soporte", to: "Soporte técnico" },
  { from: "Cliente", subject: "Orden de compra 4512", tag: "Pedido", to: "Bodega" },
];

function Email() {
  // 0 bandeja sin clasificar · 1..4 clasificando · 5 resumen · 6 espera
  const [ref, step] = useLoop(7, 1000);
  const classified = Math.min(step, CORREOS.length);
  const summary = step >= 5;
  return (
    <Frame frameRef={ref} title="Bandeja de entrada" live={summary ? "Bandeja al día" : `Clasificando ${classified}/${CORREOS.length}`}>
      <ul className="space-y-2">
        {CORREOS.map((c, i) => {
          const done = i < classified;
          const reading = i === classified && !summary;
          return (
            <li
              key={c.subject}
              className={`relative grid grid-cols-[1fr_auto] items-center gap-x-3 overflow-hidden rounded-sm px-3.5 py-2.5 transition-colors duration-300 ${
                reading ? "bg-[color-mix(in_oklch,var(--c-accent)_10%,var(--c-surface))]" : "bg-surface"
              }`}
            >
              {reading && (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 w-14 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--c-accent)_28%,transparent),transparent)]"
                  animate={{ left: ["-15%", "105%"] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className="min-w-0">
                <span className={`block truncate text-[13px] ${done ? "text-ink-muted" : "font-semibold text-ink"}`}>{c.subject}</span>
                <span className="text-[11px] text-ink-muted">{c.from}</span>
              </span>
              <AnimatePresence initial={false}>
                {done && (
                  <motion.span
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex shrink-0 items-center gap-1.5 text-[11px]"
                  >
                    <span className="rounded-pill bg-accent px-2 py-0.5 font-semibold text-accent-ink">{c.tag}</span>
                    <span className="hidden text-ink-muted sm:inline">→ {c.to}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 h-6">
        <AnimatePresence>
          {summary && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex items-center gap-2 text-[12px] text-ink"
            >
              <CheckCircleIcon size={15} weight="fill" aria-hidden className="text-accent" />
              4 correos clasificados y sus datos enviados al sistema
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ─────────────── Sitio web: se construye, se publica y se equipa ─────────────── */

const SITE_CHECKS = ["Dominio y hosting", "Certificado SSL", "Correos @suempresa", "SEO en Google", "WhatsApp y formularios"];

function Website() {
  // 0 URL · 1 estructura · 2 contenido · 3..7 servicios · 8 publicado · 9 espera
  const [ref, step] = useLoop(10, 850);
  const url = "www.suempresa.com";
  const typed = step === 0 ? 0 : url.length;
  const checks = Math.max(0, Math.min(step - 2, SITE_CHECKS.length));
  const live = step >= 8;
  const t = { duration: 0.5, ease: EASE };
  return (
    <div ref={ref} className="relative overflow-hidden rounded-lg border border-line bg-surface-2 shadow-[0_30px_80px_-40px_color-mix(in_oklch,var(--c-bg)_80%,black)]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-line" />
          ))}
        </span>
        <span className="flex flex-1 items-center gap-2 rounded-pill bg-surface px-3 py-1.5 font-mono text-[11.5px] text-ink-muted">
          <motion.span animate={{ color: step >= 4 ? "var(--c-accent)" : "var(--c-ink-muted)" }} aria-hidden>
            ●
          </motion.span>
          <motion.span
            key={step === 0 ? "a" : "b"}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: typed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 0.7, ease: "linear" }}
          >
            {url}
          </motion.span>
        </span>
        <AnimatePresence>
          {live && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-pill bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-ink">
              En línea
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1.25fr_1fr]">
        {/* boceto del sitio que se arma */}
        <div className="rounded-sm border border-line bg-bg p-3" aria-hidden>
          <motion.div initial={false} animate={{ opacity: step >= 1 ? 1 : 0.15 }} transition={t} className="flex items-center justify-between">
            <span className="h-2.5 w-12 rounded bg-ink/70" />
            <span className="flex gap-1.5">
              {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-6 rounded bg-ink-muted/50" />)}
            </span>
          </motion.div>
          <motion.div initial={false} animate={{ opacity: step >= 2 ? 1 : 0.15, y: step >= 2 ? 0 : 6 }} transition={t} className="mt-5 space-y-1.5">
            <span className="block h-3.5 w-[85%] rounded bg-ink/80" />
            <span className="block h-3.5 w-[60%] rounded bg-ink/80" />
            <span className="mt-2 block h-1.5 w-[90%] rounded bg-ink-muted/40" />
            <span className="block h-1.5 w-[70%] rounded bg-ink-muted/40" />
            <span className="mt-3 block h-5 w-20 rounded-pill bg-accent" />
          </motion.div>
          <motion.div initial={false} animate={{ opacity: step >= 2 ? 1 : 0.15 }} transition={{ ...t, delay: 0.15 }} className="mt-4 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => <span key={i} className="h-9 rounded-[4px] bg-surface" />)}
          </motion.div>
        </div>

        {/* lo que entregamos */}
        <ul className="space-y-2">
          {SITE_CHECKS.map((c, i) => {
            const on = i < checks;
            return (
              <li key={c} className={`flex items-center gap-2 rounded-sm px-3 py-2 text-[12.5px] transition-colors duration-300 ${on ? "bg-surface text-ink" : "text-ink-muted/50"}`}>
                <motion.span
                  initial={false}
                  animate={{ scale: on ? 1 : 0.7, backgroundColor: on ? "var(--c-accent)" : "transparent" }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="grid size-4 shrink-0 place-items-center rounded-full border border-line text-accent-ink"
                >
                  {on && <CheckIcon size={10} weight="bold" aria-hidden />}
                </motion.span>
                {c}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="border-t border-line px-5 py-3 text-[11px] text-ink-muted">Ejemplo ilustrativo de entrega</p>
    </div>
  );
}

/* ─────────────── Órbita: herramientas y estándares alrededor del núcleo ─────────────── */

const INNER = ["Odoo", "Python", "PostgreSQL", "IA"];
const OUTER = ["React", "Next.js", "APIs REST", "Git", "Nube", "WhatsApp API"];

function Ring({ items, radius, duration, reverse }: { items: string[]; radius: number; duration: number; reverse?: boolean }) {
  return (
    <div
      className="orbit-ring absolute inset-0"
      style={{ animation: `spin ${duration}s linear infinite${reverse ? " reverse" : ""}` }}
    >
      <span
        aria-hidden
        className="absolute rounded-full border border-dashed border-line"
        style={{ inset: `${50 - radius}%` }}
      />
      {items.map((label, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${50 + radius * Math.cos(a)}%`, top: `${50 + radius * Math.sin(a)}%` }}
          >
            <span
              className="orbit-chip block whitespace-nowrap rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink shadow-[0_8px_24px_-12px_black]"
              style={{ animation: `spin ${duration}s linear infinite${reverse ? "" : " reverse"}` }}
            >
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Orbit() {
  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-[30rem]" role="img" aria-label="Herramientas con las que trabajamos: Odoo, Python, PostgreSQL, inteligencia artificial, React, Next.js, APIs REST, Git, servicios en la nube y la API de WhatsApp.">
        <div
          aria-hidden
          className="absolute inset-[18%] rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--c-accent) 26%, transparent), transparent 70%)" }}
        />
        <Ring items={OUTER} radius={44} duration={60} />
        <Ring items={INNER} radius={27} duration={42} reverse />
        <div className="absolute left-1/2 top-1/2 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-accent bg-surface-2">
          <span className="font-display text-[clamp(0.85rem,2vw,1.15rem)] font-bold tracking-[0.16em] text-ink">AUROM</span>
          <span aria-hidden className="absolute inset-[-14%] rounded-full border border-accent/40 animate-[soft-pulse_3s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

const visuals: Record<VisualName, () => ReactNode> = {
  payroll: Payroll,
  airbnb: Airbnb,
  assistant: Assistant,
  sicop: Sicop,
  budget: Budget,
  data: Data,
  maintenance: Maintenance,
  email: Email,
  website: Website,
  orbit: Orbit,
};

export function SolutionVisual({ name }: { name: VisualName }) {
  const V = visuals[name];
  return <V />;
}
