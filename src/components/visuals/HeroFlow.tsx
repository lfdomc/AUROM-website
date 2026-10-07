"use client";
import { useEffect, useRef } from "react";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";

type Lane = { input: string; output: string };

const W = 640;
const H = 460;
const CX = 320;
const CY = 230;
const CARD_W = 196;
const CYCLE = 10; // s
const STEP = 2.5; // s entre carriles

const centers = (n: number) => {
  const top = 70;
  const bottom = 390;
  return Array.from({ length: n }, (_, i) => (n === 1 ? CY : top + ((bottom - top) / (n - 1)) * i));
};

const lanePath = (y: number) =>
  `M${CARD_W},${y} C${CARD_W + 52},${y} ${CX - 72},${CY} ${CX - 52},${CY} L${CX + 52},${CY} C${CX + 72},${CY} ${W - CARD_W - 52},${y} ${W - CARD_W},${y}`;

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/**
 * Momento firma: cada entrada (un dato que hoy se procesa a mano) viaja por el núcleo y sale como resultado.
 * CSS + SMIL, sin JS por fotograma. Se pausa fuera de pantalla y queda estático con movimiento reducido.
 */
export function HeroFlow({ lanes, brand }: { lanes: Lane[]; brand: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const ys = centers(lanes.length);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.classList.toggle("paused", !e.isIntersecting);
      if (e.isIntersecting) svg.current?.unpauseAnimations();
      else svg.current?.pauseAnimations();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="flow relative" role="img" aria-label={`Diagrama: ${lanes.map((l) => `${l.input} se convierte en ${l.output}`).join("; ")}.`}>
      {/* ───── Escritorio ───── */}
      <div className="relative hidden w-full lg:block" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {ys.map((y, i) => (
            <path key={`l${i}`} id={`lane-${i}`} d={lanePath(y)} fill="none" stroke="var(--c-border)" strokeWidth="1.5" className="flow-line" />
          ))}

          <circle cx={CX} cy={CY} r="120" fill="url(#coreGlow)" />
          {ys.map((_, i) => {
            const begin = `${i * STEP}s`;
            return (
              <circle key={`d${i}`} r="5.5" fill="var(--c-accent)" opacity="0" className="flow-dot">
                <animateMotion dur={`${CYCLE}s`} begin={begin} repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.16;1" calcMode="linear">
                  <mpath href={`#lane-${i}`} />
                </animateMotion>
                <animate attributeName="opacity" dur={`${CYCLE}s`} begin={begin} repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.16;0.17;1" />
              </circle>
            );
          })}
          <g className="flow-ring">
            <circle cx={CX} cy={CY} r="70" fill="none" stroke="var(--c-accent)" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="2 9" />
          </g>
          <g className="flow-core" style={{ animationDelay: "0.8s" }}>
            <circle cx={CX} cy={CY} r="52" fill="var(--c-surface-2)" stroke="var(--c-accent)" strokeWidth="1.5" />
            <text x={CX} y={CY + 6} textAnchor="middle" fill="var(--c-ink)" style={{ font: "700 17px var(--font-display)", letterSpacing: "0.16em" }}>
              {brand}
            </text>
          </g>

        </svg>

        {lanes.map((l, i) => (
          <div key={`in${i}`}>
            <div
              className="flow-card-in absolute flex items-center rounded-sm border px-3.5 text-[13.5px] font-medium leading-tight"
              style={{ left: 0, top: pct(ys[i] - 26, H), width: pct(CARD_W, W), height: pct(52, H), animationDelay: `${i * STEP}s` }}
            >
              {l.input}
            </div>
            <div
              className="flow-card-out absolute flex items-center gap-2 rounded-sm border px-3.5 text-[13.5px] font-medium leading-tight"
              style={{ right: 0, top: pct(ys[i] - 26, H), width: pct(CARD_W, W), height: pct(52, H), animationDelay: `${i * STEP}s` }}
            >
              <span className="flow-check grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" style={{ animationDelay: `${i * STEP}s` }}>
                <CheckIcon size={12} weight="bold" />
              </span>
              <span>{l.output}</span>
            </div>
          </div>
        ))}

        <span className="absolute left-0 -top-7 text-xs font-medium text-ink-muted">Hoy, a mano</span>
        <span className="absolute right-0 -top-7 text-xs font-medium text-ink-muted">Con el sistema</span>
      </div>

      {/* ───── Móvil y tableta ───── */}
      <ul className="space-y-2.5 lg:hidden" aria-hidden>
        {lanes.map((l, i) => (
          <li key={i} className="grid grid-cols-[1fr_44px_1fr] items-center">
            <span className="flow-card-in rounded-sm border px-3 py-2.5 text-[13px] font-medium leading-tight" style={{ animationDelay: `${i * STEP}s` }}>
              {l.input}
            </span>
            <span className="relative mx-1 h-px bg-line">
              <span className="row-dot flow-dot absolute -top-[3.5px] size-2 rounded-full bg-accent" style={{ animationDelay: `${i * STEP}s` }} />
            </span>
            <span className="flow-card-out rounded-sm border px-3 py-2.5 text-[13px] font-medium leading-tight" style={{ animationDelay: `${i * STEP}s` }}>
              {l.output}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
