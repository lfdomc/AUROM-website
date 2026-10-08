"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SectionData } from "@/lib/schema";
import {
  ACTUALIZADO,
  CCSS_PATRONO,
  CCSS_TRABAJADOR,
  CCSS_TRABAJADOR_DETALLE,
  CESANTIA_TABLA,
  CREDITO_CONYUGE,
  CREDITO_HIJO,
  INS_CLASES,
  TRAMOS_RENTA,
  TRAMOS_LUCRATIVA,
  TRAMOS_JURIDICAS,
  UMBRAL_PYME,
  TARIFA_GENERAL_JURIDICAS,
  CREDITO_HIJO_ANUAL,
  CREDITO_CONYUGE_ANUAL,
  VIGENCIA,
  aguinaldo,
  costoPatronal,
  crc,
  miles,
  liquidacion,
  pct,
  salarioNeto,
  salariosDesdeDiciembre,
  type Motivo,
} from "@/lib/planilla";
import { Shell } from "./Shell";

type Props = { section: Extract<SectionData, { type: "calculator" }> };

/* ─────────────────  Controles  ───────────────── */

const parse = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;
const fmt = (n: number) => (n ? miles(n) : "");

function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor: string }) {
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

const inputCls =
  "h-12 w-full rounded-sm border border-line bg-bg px-4 text-[1.05rem] text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--c-accent)_30%,transparent)]";

function Money({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (n: number) => void }) {
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
          value={fmt(value)}
          placeholder="0"
          onChange={(e) => onChange(parse(e.target.value))}
        />
      </div>
    </Field>
  );
}

function Num({ label, hint, value, onChange, max = 999, step = 1 }: { label: string; hint?: string; value: number; onChange: (n: number) => void; max?: number; step?: number }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="number"
        min={0}
        max={max}
        step={step}
        className={`${inputCls} font-mono`}
        value={value || ""}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
      />
    </Field>
  );
}

function DateIn({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} type="date" className={`${inputCls} font-mono`} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[0.95rem]">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-11 shrink-0 rounded-pill bg-surface-2 ring-1 ring-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-accent-ink" />
      {label}
    </label>
  );
}

function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
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

/* ─────────────────  Resultado  ───────────────── */

type Row = { label: string; value: number; sign?: "+" | "-"; note?: string };

function Result({ title, total, totalLabel, rows, extra }: { title: string; total: number; totalLabel: string; rows: Row[]; extra?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col rounded-lg bg-ink p-6 text-bg md:p-8" aria-live="polite">
      <p className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-accent">{title}</p>
      <p className="mt-2 text-[0.95rem] opacity-70">{totalLabel}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={Math.round(total)}
          initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold tabular-nums leading-tight"
        >
          {crc(total)}
        </motion.p>
      </AnimatePresence>
      <dl className="mt-6 grid gap-0 border-t border-bg/15">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-bg/10 py-3">
            <dt className="text-[0.95rem] opacity-80">
              {r.label}
              {r.note && <span className="block text-[0.8rem] opacity-60">{r.note}</span>}
            </dt>
            <dd className={`font-mono text-[0.98rem] tabular-nums ${r.sign === "-" ? "text-[#ff9b8a]" : ""}`}>
              {r.sign === "-" ? "− " : r.sign === "+" ? "+ " : ""}
              {crc(r.value)}
            </dd>
          </div>
        ))}
      </dl>
      {extra}
      <p className="mt-auto pt-6 text-[0.8rem] opacity-60">Cálculo de referencia con las reglas {VIGENCIA}. No sustituye una asesoría legal o contable.</p>
    </div>
  );
}

/* ─────────────────  Tablas de datos (texto indexable)  ───────────────── */

function Table({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[30rem] border-collapse text-left text-[0.95rem]">
        <caption className="bg-surface px-5 py-4 text-left font-display text-lg font-bold">{caption}</caption>
        <thead>
          <tr className="border-y border-line bg-surface-2/60">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`px-5 py-3 ${j > 0 ? "font-mono tabular-nums" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const money0 = (n: number) => "₡" + miles(n);

function TablaRenta() {
  return (
    <Table
      caption={`Impuesto al salario ${VIGENCIA}: asalariados y pensionados (mensual)`}
      head={["Salario mensual", "Tarifa"]}
      rows={filasTramos(TRAMOS_RENTA)}
    />
  );
}

type Tramo = { desde: number; hasta: number; tasa: number };
const filasTramos = (t: readonly Tramo[], exento = true) =>
  t.map((x, i) => [
    i === 0 ? `Hasta ${money0(x.hasta)}` : x.hasta === Infinity ? `Exceso de ${money0(x.desde)}` : `Exceso de ${money0(x.desde)} y hasta ${money0(x.hasta)}`,
    x.tasa === 0 && exento ? "Exento" : pct(x.tasa),
  ]);

function TablaLucrativa() {
  return (
    <Table
      caption={`Actividad lucrativa ${VIGENCIA}: personas físicas (renta neta anual)`}
      head={["Renta neta anual", "Tarifa"]}
      rows={[
        ...filasTramos(TRAMOS_LUCRATIVA),
        ["Crédito anual por hijo / por cónyuge", `${money0(CREDITO_HIJO_ANUAL)} / ${money0(CREDITO_CONYUGE_ANUAL)}`],
      ]}
    />
  );
}

function TablaJuridicas() {
  return (
    <Table
      caption={`Personas jurídicas ${VIGENCIA} con renta bruta hasta ${money0(UMBRAL_PYME)} (anual)`}
      head={["Renta neta anual", "Tarifa"]}
      rows={[...filasTramos(TRAMOS_JURIDICAS, false), [`Renta bruta mayor a ${money0(UMBRAL_PYME)}`, `${pct(TARIFA_GENERAL_JURIDICAS)} (tarifa general)`]]}
    />
  );
}

function TablaCcss() {
  return (
    <Table
      caption={`Cargas sociales CCSS ${VIGENCIA}`}
      head={["Concepto", "Porcentaje"]}
      rows={[
        ...CCSS_TRABAJADOR_DETALLE.map((d) => [`Trabajador: ${d.nombre}`, pct(d.tasa)]),
        ["Total que se rebaja al trabajador", pct(CCSS_TRABAJADOR)],
        ["Total que paga el patrono", pct(CCSS_PATRONO)],
      ]}
    />
  );
}

function TablaCreditos() {
  return (
    <Table
      caption={`Créditos fiscales ${VIGENCIA} (se restan del impuesto)`}
      head={["Crédito", "Monto mensual"]}
      rows={[
        ["Por cada hijo", money0(CREDITO_HIJO)],
        ["Por cónyuge", money0(CREDITO_CONYUGE)],
      ]}
    />
  );
}

function TablaLiquidacion() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Table
        caption="Preaviso (artículo 28 del Código de Trabajo)"
        head={["Tiempo laborado", "Preaviso"]}
        rows={[
          ["Menos de 3 meses", "No corresponde"],
          ["De 3 a 6 meses", "1 semana (7 días)"],
          ["De 6 meses a 1 año", "15 días"],
          ["Más de 1 año", "1 mes (30 días)"],
        ]}
      />
      <Table
        caption="Cesantía (artículo 29 del Código de Trabajo)"
        head={["Antigüedad", "Días de salario"]}
        rows={[
          ["Menos de 3 meses", "No corresponde"],
          ["De 3 a 6 meses", "7 días"],
          ["De 6 meses a 1 año", "14 días"],
          ...CESANTIA_TABLA.map((c) => [c.anios, `${c.dias.toLocaleString("es-CR")} días por año`]),
        ]}
      />
    </div>
  );
}

function TablaPatronal() {
  return (
    <Table
      caption={`Riesgos del trabajo (INS): tarifas de referencia ${VIGENCIA}`}
      head={["Clase", "Tarifa", "Actividades típicas"]}
      rows={INS_CLASES.map((c) => [`Clase ${c.id}`, pct(c.tasa), c.ejemplo])}
    />
  );
}

/* ─────────────────  Calculadoras  ───────────────── */

function CalcSalarioNeto() {
  const [salario, setSalario] = useState(1_200_000);
  const [heS, setHeS] = useState(0);
  const [heD, setHeD] = useState(0);
  const [otros, setOtros] = useState(0);
  const [hijos, setHijos] = useState(0);
  const [conyuge, setConyuge] = useState(false);
  const r = useMemo(() => salarioNeto({ salario, heSimples: heS, heDobles: heD, otros, hijos, conyuge }), [salario, heS, heD, otros, hijos, conyuge]);
  return (
    <Layout
      form={
        <>
          <Money label="Salario bruto mensual" value={salario} onChange={setSalario} hint="Salario base del mes, antes de rebajos." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Horas extra sencillas" value={heS} onChange={setHeS} hint="Se pagan a tiempo y medio." />
            <Num label="Horas extra dobles" value={heD} onChange={setHeD} hint="Feriados y días de descanso." />
          </div>
          <Money label="Otros ingresos del mes" value={otros} onChange={setOtros} hint="Comisiones, bonos u otros pagos gravables." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Hijos (crédito fiscal)" value={hijos} onChange={setHijos} max={20} />
            <div className="flex items-end pb-3">
              <Toggle label="Aplica crédito por cónyuge" checked={conyuge} onChange={setConyuge} />
            </div>
          </div>
        </>
      }
      result={
        <Result
          title="Salario neto"
          totalLabel="Recibe al mes"
          total={r.neto}
          rows={[
            { label: "Salario bruto", value: salario },
            ...(r.extras ? [{ label: "Horas extra", value: r.extras, sign: "+" as const, note: `Valor hora: ${crc(r.valorHora)}` }] : []),
            ...(otros ? [{ label: "Otros ingresos", value: otros, sign: "+" as const }] : []),
            { label: `CCSS trabajador (${pct(CCSS_TRABAJADOR)})`, value: r.ccss, sign: "-" },
            {
              label: "Impuesto sobre la renta",
              value: r.renta.total,
              sign: "-",
              note: r.renta.creditos ? `Incluye créditos fiscales por ${crc(r.renta.creditos)}` : r.renta.total === 0 ? "Exento: no supera el primer tramo" : undefined,
            },
          ]}
          extra={<p className="mt-4 text-[0.95rem]">Por quincena: <strong className="font-mono">{crc(r.quincena)}</strong></p>}
        />
      }
    />
  );
}

function CalcAguinaldo() {
  const meses = ["Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov"];
  const [modo, setModo] = useState<"igual" | "mes">("igual");
  const [salario, setSalario] = useState(650_000);
  const [mesesTrab, setMesesTrab] = useState(12);
  const [porMes, setPorMes] = useState<number[]>(Array(12).fill(650_000));
  const salarios = modo === "igual" ? Array.from({ length: 12 }, (_, i) => (i < mesesTrab ? salario : 0)) : porMes;
  const r = aguinaldo(salarios);
  return (
    <Layout
      form={
        <>
          <Segmented
            label="¿Cómo quiere ingresar el salario?"
            value={modo}
            onChange={setModo}
            options={[
              { value: "igual", label: "Mismo salario todos los meses" },
              { value: "mes", label: "Mes por mes" },
            ]}
          />
          {modo === "igual" ? (
            <>
              <Money label="Salario bruto mensual" value={salario} onChange={setSalario} hint="Incluya horas extra y comisiones si las recibe de forma regular." />
              <Num label="Meses trabajados entre el 1 de diciembre y el 30 de noviembre" value={mesesTrab} onChange={setMesesTrab} max={12} step={0.5} />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {meses.map((m, i) => (
                <Money key={m} label={m} value={porMes[i]} onChange={(n) => setPorMes((p) => p.map((v, j) => (j === i ? n : v)))} />
              ))}
            </div>
          )}
        </>
      }
      result={
        <Result
          title="Aguinaldo"
          totalLabel="Le corresponde"
          total={r.aguinaldo}
          rows={[
            { label: "Salarios del periodo (dic. a nov.)", value: r.total },
            { label: "CCSS y renta", value: 0, note: "El aguinaldo no paga cargas sociales ni impuesto" },
          ]}
          extra={<p className="mt-4 text-[0.95rem]">Fórmula: total de salarios ÷ 12. Se paga a más tardar el 20 de diciembre.</p>}
        />
      }
    />
  );
}

function CalcLiquidacion() {
  // Fechas fijas en el HTML estático; al cargar se ajustan a hoy (evita diferencias de hidratación).
  const [ingreso, setIngreso] = useState("2023-02-01");
  const [salida, setSalida] = useState("2026-10-31");
  useEffect(() => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setSalida(iso);
    setIngreso(`${d.getFullYear() - 3}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }, []);
  const [promedio, setPromedio] = useState(700_000);
  const [motivo, setMotivo] = useState<Motivo>("despido");
  const [preavisoOtorgado, setPreavisoOtorgado] = useState(false);
  const [vac, setVac] = useState(0);
  const r = liquidacion({
    ingreso,
    salida,
    promedio,
    motivo,
    preavisoOtorgado,
    vacacionesPendientes: vac,
    salariosDesdeDiciembre: salariosDesdeDiciembre(ingreso, salida, promedio),
  });
  const anios = Math.floor(r.meses / 12);
  const resto = Math.floor(r.meses % 12);
  return (
    <Layout
      form={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <DateIn label="Fecha de ingreso" value={ingreso} onChange={setIngreso} />
            <DateIn label="Fecha de salida" value={salida} onChange={setSalida} />
          </div>
          <Money label="Salario promedio de los últimos 6 meses" value={promedio} onChange={setPromedio} hint="Promedio bruto mensual, incluidas horas extra y comisiones." />
          <Segmented
            label="Motivo de salida"
            value={motivo}
            onChange={setMotivo}
            options={[
              { value: "despido", label: "Despido sin justa causa" },
              { value: "renuncia", label: "Renuncia" },
              { value: "justa-causa", label: "Despido con justa causa" },
            ]}
          />
          {motivo === "despido" && <Toggle label="El preaviso ya se dio trabajando" checked={preavisoOtorgado} onChange={setPreavisoOtorgado} />}
          <Num label="Días de vacaciones pendientes" value={vac} onChange={setVac} max={120} step={0.5} hint="Se ganan 2 semanas por cada 50 semanas, o 1 día por mes si no completó el periodo." />
        </>
      }
      result={
        <Result
          title="Liquidación laboral"
          totalLabel={`Total estimado · ${anios} años y ${resto} meses laborados`}
          total={r.total}
          rows={[
            { label: "Preaviso", value: r.preaviso, note: motivo === "despido" ? `${r.dPreaviso} días` : "No corresponde por el motivo de salida" },
            { label: "Cesantía", value: r.cesantia, note: motivo === "despido" ? `${r.dCesantia.toLocaleString("es-CR", { maximumFractionDigits: 2 })} días` : "No corresponde por el motivo de salida" },
            { label: "Vacaciones pendientes", value: r.vacaciones, note: `${vac} días · salario diario ${crc(r.diario)}` },
            { label: "Aguinaldo proporcional", value: r.aguinaldo, note: "Desde el 1 de diciembre hasta la salida" },
          ]}
        />
      }
    />
  );
}

function CalcCostoPatronal() {
  const [salario, setSalario] = useState(800_000);
  const [clase, setClase] = useState(0);
  const [prov, setProv] = useState(true);
  const [personas, setPersonas] = useState(1);
  const r = costoPatronal(salario, clase, prov);
  return (
    <Layout
      form={
        <>
          <Money label="Salario bruto mensual por colaborador" value={salario} onChange={setSalario} />
          <Segmented
            label="Clase de riesgo del INS"
            value={clase}
            onChange={setClase}
            options={INS_CLASES.map((c, i) => ({ value: i, label: `${c.id} · ${pct(c.tasa)}` }))}
          />
          <p className="-mt-3 text-[0.82rem] text-ink-muted">{INS_CLASES[clase].ejemplo}. La tarifa exacta depende de la actividad en su póliza.</p>
          <Num label="Cantidad de colaboradores con este salario" value={personas} onChange={setPersonas} max={5000} />
          <Toggle label="Incluir reservas de aguinaldo y vacaciones" checked={prov} onChange={setProv} />
        </>
      }
      result={
        <Result
          title="Costo patronal"
          totalLabel={personas > 1 ? `Costo mensual de ${personas} colaboradores` : "Costo mensual por colaborador"}
          total={r.total * Math.max(1, personas)}
          rows={[
            { label: "Salario bruto", value: salario },
            { label: `CCSS patronal (${pct(CCSS_PATRONO)})`, value: r.ccss, sign: "+" },
            { label: `Riesgos del trabajo INS (${pct(INS_CLASES[clase].tasa)})`, value: r.ins, sign: "+" },
            ...(prov
              ? [
                  { label: "Reserva de aguinaldo (8,33 %)", value: r.aguinaldo, sign: "+" as const },
                  { label: "Reserva de vacaciones (4,17 %)", value: r.vacaciones, sign: "+" as const },
                ]
              : []),
          ]}
          extra={
            <p className="mt-4 text-[0.95rem]">
              Cada ₡1 de salario cuesta <strong className="font-mono">₡{r.factor.toLocaleString("es-CR", { maximumFractionDigits: 2 })}</strong>. Al año:{" "}
              <strong className="font-mono">{crc(r.anual * Math.max(1, personas))}</strong>
            </p>
          }
        />
      }
    />
  );
}

function Layout({ form, result }: { form: ReactNode; result: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form className="grid content-start gap-6 rounded-lg border border-line bg-surface p-6 md:p-8 lg:col-span-7" onSubmit={(e) => e.preventDefault()}>
        {form}
      </form>
      <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">{result}</div>
    </div>
  );
}

const calcs = {
  "salario-neto": { C: CalcSalarioNeto, tables: [TablaRenta, TablaCreditos, TablaCcss, TablaLucrativa, TablaJuridicas] },
  aguinaldo: { C: CalcAguinaldo, tables: [] },
  liquidacion: { C: CalcLiquidacion, tables: [TablaLiquidacion] },
  "costo-patronal": { C: CalcCostoPatronal, tables: [TablaPatronal, TablaCcss] },
} as const;

export function Calculator({ section: s }: Props) {
  const { C, tables } = calcs[s.kind];
  return (
    <Shell id={s.id ?? "calculadora"} background={s.background}>
      <div className="container-x">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] font-bold">{s.heading}</h2>
          {s.intro && <p className="mt-4 max-w-[62ch] text-lg text-ink-muted">{s.intro}</p>}
          <p className="mt-3 text-[0.88rem] text-ink-muted">Datos vigentes {VIGENCIA} · actualizado en {ACTUALIZADO}</p>
        </div>
        <C />
        {tables.length > 0 && (
          <div className={`mt-12 grid gap-6 ${tables.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {tables.map((T, i) => (
              <T key={i} />
            ))}
          </div>
        )}
        {s.sources && s.sources.length > 0 && (
          <p className="mt-8 text-[0.85rem] text-ink-muted">
            Fuentes:{" "}
            {s.sources.map((src, i) => (
              <span key={src.url}>
                {i > 0 && " · "}
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
                  {src.label}
                </a>
              </span>
            ))}
          </p>
        )}
      </div>
    </Shell>
  );
}
