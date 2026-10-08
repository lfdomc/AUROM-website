"use client";

import { useEffect } from "react";
import {
  CCSS_PATRONO,
  CCSS_TRABAJADOR,
  CREDITO_CONYUGE,
  CREDITO_HIJO,
  FACTOR_HE_FERIADO,
  FACTOR_HE_SIMPLE,
  INS_CLASES,
  JORNADAS,
  TRAMOS_RENTA,
  VIGENCIA,
  aguinaldo,
  costoPatronal,
  crc,
  crc0,
  datos,
  fechaLarga,
  horasExtra,
  hoyIso,
  liquidacion,
  num,
  pct,
  salarioNeto,
  salariosDesdeDiciembre,
  vacaciones,
  type Motivo,
} from "@/lib/planilla";
import type { Report } from "./report";
import { DateIn, Layout, Money, Num, Segmented, Toggle } from "./ui";
import { useQueryState } from "./useQueryState";

const si = (b: boolean) => (b ? "Sí" : "No");
const basisRenta = () =>
  `Impuesto al salario ${VIGENCIA}, ${datos.renta.decreto}: ` +
  TRAMOS_RENTA.map((t, i) => (i === 0 ? `exento hasta ${crc0(t.hasta)}` : t.hasta === Infinity ? `${pct(t.tasa)} sobre ${crc0(t.desde)}` : `${pct(t.tasa)} hasta ${crc0(t.hasta)}`)).join("; ") +
  `. Créditos: ${crc0(CREDITO_HIJO)} por hijo y ${crc0(CREDITO_CONYUGE)} por cónyuge.`;
const basisCcss = () => `CCSS ${VIGENCIA}: ${pct(CCSS_TRABAJADOR)} a cargo del trabajador y ${pct(CCSS_PATRONO)} a cargo del patrono.`;

/* ─────────────────  Salario neto  ───────────────── */

export function CalcSalarioNeto() {
  const { state: s, set, query } = useQueryState({ salario: 1_200_000, hs: 0, hd: 0, otros: 0, hijos: 0, conyuge: false }, "salario-neto");
  const r = salarioNeto({ salario: s.salario, heSimples: s.hs, heDobles: s.hd, otros: s.otros, hijos: s.hijos, conyuge: s.conyuge });
  const report: Report = {
    title: `Calculadora de salario neto Costa Rica ${VIGENCIA}`,
    label: "Salario neto",
    totalLabel: "Salario neto mensual",
    total: r.neto,
    inputs: [
      ["Salario bruto mensual", crc(s.salario)],
      ["Horas extra sencillas", num(s.hs)],
      ["Horas extra dobles", num(s.hd)],
      ["Otros ingresos del mes", crc(s.otros)],
      ["Hijos (crédito fiscal)", String(s.hijos)],
      ["Crédito por cónyuge", si(s.conyuge)],
    ],
    rows: [
      { label: "Salario bruto", value: s.salario },
      ...(r.extras ? [{ label: "Horas extra", value: r.extras, sign: "+" as const, note: `Valor hora: ${crc(r.valorHora)}` }] : []),
      ...(s.otros ? [{ label: "Otros ingresos", value: s.otros, sign: "+" as const }] : []),
      { label: `CCSS trabajador (${pct(CCSS_TRABAJADOR)})`, value: r.ccss, sign: "-", note: `Sobre ${crc(r.bruto)}` },
      {
        label: "Impuesto sobre la renta",
        value: r.renta.total,
        sign: "-",
        note:
          r.renta.total === 0 && r.renta.bruto === 0
            ? `Exento: no supera ${crc0(TRAMOS_RENTA[0].hasta)}`
            : r.renta.detalle
                .filter((d) => d.impuesto > 0)
                .map((d) => `${pct(d.tasa)} de ${crc0(d.base)}`)
                .join(" + ") + (r.renta.creditos ? ` − créditos ${crc0(r.renta.creditos)}` : ""),
      },
    ],
    extras: [`Por quincena: ${crc(r.quincena)}`],
    basis: [basisRenta(), basisCcss(), "Horas extra: valor hora = salario mensual ÷ 30 ÷ 8; sencillas a tiempo y medio, dobles al doble."],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Money label="Salario bruto mensual" value={s.salario} onChange={set("salario")} hint="Salario base del mes, antes de rebajos." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Horas extra sencillas" value={s.hs} onChange={set("hs")} hint="Se pagan a tiempo y medio." />
            <Num label="Horas extra dobles" value={s.hd} onChange={set("hd")} hint="Feriados y días de descanso." />
          </div>
          <Money label="Otros ingresos del mes" value={s.otros} onChange={set("otros")} hint="Comisiones, bonos u otros pagos gravables." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Hijos (crédito fiscal)" value={s.hijos} onChange={set("hijos")} max={20} />
            <div className="flex items-end pb-3">
              <Toggle label="Aplica crédito por cónyuge" checked={s.conyuge} onChange={set("conyuge")} />
            </div>
          </div>
        </>
      }
    />
  );
}

/* ─────────────────  Aguinaldo  ───────────────── */

const MESES_AG = ["Diciembre", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre"];

export function CalcAguinaldo() {
  const { state: s, set, query } = useQueryState({ modo: "igual", salario: 650_000, meses: 12, lista: Array(12).fill(650_000).join(",") }, "aguinaldo");
  const lista = s.lista.split(",").map((x) => Number(x) || 0);
  while (lista.length < 12) lista.push(0);
  const salarios = s.modo === "igual" ? Array.from({ length: 12 }, (_, i) => (i < Math.floor(s.meses) ? s.salario : i < s.meses ? s.salario * (s.meses % 1) : 0)) : lista;
  const r = aguinaldo(salarios);
  const report: Report = {
    title: `Calculadora de aguinaldo Costa Rica ${VIGENCIA}`,
    label: "Aguinaldo",
    totalLabel: "Aguinaldo a recibir",
    total: r.aguinaldo,
    inputs:
      s.modo === "igual"
        ? [
            ["Salario bruto mensual", crc(s.salario)],
            ["Meses trabajados (dic. a nov.)", num(s.meses)],
          ]
        : MESES_AG.map((m, i) => [m, crc(lista[i])] as [string, string]),
    rows: [
      { label: "Suma de salarios del periodo", value: r.total, note: "Del 1 de diciembre al 30 de noviembre" },
      { label: "Dividido entre 12", text: `${crc(r.total)} ÷ 12` },
      { label: "CCSS y renta", value: 0, note: "El aguinaldo no paga cargas sociales ni impuesto" },
    ],
    extras: ["Se paga a más tardar el 20 de diciembre."],
    basis: [
      "Ley 2412: el aguinaldo es la suma de los salarios ordinarios y extraordinarios del 1 de diciembre al 30 de noviembre, dividida entre 12.",
      "Exento del impuesto sobre la renta (artículo 35 de la Ley del Impuesto sobre la Renta) y de las cuotas de la CCSS.",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Segmented
            label="¿Cómo quiere ingresar el salario?"
            value={s.modo}
            onChange={set("modo")}
            options={[
              { value: "igual", label: "Mismo salario todos los meses" },
              { value: "mes", label: "Mes por mes" },
            ]}
          />
          {s.modo === "igual" ? (
            <>
              <Money label="Salario bruto mensual" value={s.salario} onChange={set("salario")} hint="Incluya horas extra y comisiones si las recibe de forma regular." />
              <Num label="Meses trabajados entre el 1 de diciembre y el 30 de noviembre" value={s.meses} onChange={set("meses")} max={12} step={0.5} />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {MESES_AG.map((m, i) => (
                <Money key={m} label={m} value={lista[i]} onChange={(n) => set("lista")(lista.map((v, j) => (j === i ? n : v)).join(","))} />
              ))}
            </div>
          )}
        </>
      }
    />
  );
}

/* ─────────────────  Liquidación  ───────────────── */

const MOTIVOS: { value: Motivo; label: string }[] = [
  { value: "despido", label: "Despido sin justa causa" },
  { value: "renuncia", label: "Renuncia" },
  { value: "justa-causa", label: "Despido con justa causa" },
];

export function CalcLiquidacion() {
  const { state: s, set, query, fromUrl } = useQueryState(
    { ingreso: "2023-02-01", salida: "2026-10-31", promedio: 700_000, motivo: "despido", preaviso: false, vac: 0 },
    "liquidacion",
  );
  // Fechas fijas en el HTML estático; al abrir se ajustan a hoy si el enlace no trae datos.
  useEffect(() => {
    if (fromUrl) return;
    const hoy = hoyIso();
    set("salida")(hoy);
    set("ingreso")(`${Number(hoy.slice(0, 4)) - 3}-${hoy.slice(5, 7)}-01`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);
  const motivo = s.motivo as Motivo;
  const r = liquidacion({
    ingreso: s.ingreso,
    salida: s.salida,
    promedio: s.promedio,
    motivo,
    preavisoOtorgado: s.preaviso,
    vacacionesPendientes: s.vac,
    salariosDesdeDiciembre: salariosDesdeDiciembre(s.ingreso, s.salida, s.promedio),
  });
  const anios = Math.floor(r.meses / 12);
  const resto = Math.floor(r.meses % 12);
  const noAplica = "No corresponde por el motivo de salida";
  const report: Report = {
    title: "Calculadora de liquidación laboral Costa Rica",
    label: "Liquidación laboral",
    totalLabel: `Total estimado · ${anios} ${anios === 1 ? "año" : "años"} y ${resto} ${resto === 1 ? "mes" : "meses"} laborados`,
    total: r.total,
    inputs: [
      ["Fecha de ingreso", fechaLarga(s.ingreso)],
      ["Fecha de salida", fechaLarga(s.salida)],
      ["Salario promedio últimos 6 meses", crc(s.promedio)],
      ["Motivo de salida", MOTIVOS.find((m) => m.value === motivo)?.label ?? ""],
      ...(motivo === "despido" ? [["Preaviso ya otorgado", si(s.preaviso)] as [string, string]] : []),
      ["Vacaciones pendientes", `${num(s.vac)} días`],
    ],
    rows: [
      { label: "Preaviso", value: r.preaviso, note: motivo === "despido" ? `${r.dPreaviso} días × ${crc(r.diario)}` : noAplica },
      { label: "Cesantía", value: r.cesantia, note: motivo === "despido" ? `${num(r.dCesantia)} días × ${crc(r.diario)}` : noAplica },
      { label: "Vacaciones pendientes", value: r.vacaciones, note: `${num(s.vac)} días × ${crc(r.diario)}` },
      { label: "Aguinaldo proporcional", value: r.aguinaldo, note: "Desde el 1 de diciembre hasta la salida, ÷ 12" },
    ],
    basis: [
      "Salario diario = promedio de los últimos 6 meses ÷ 30.",
      "Preaviso (art. 28 del Código de Trabajo): 7 días de 3 a 6 meses, 15 días de 6 meses a 1 año y 30 días después del primer año.",
      "Cesantía (art. 29): 7 días de 3 a 6 meses, 14 días de 6 meses a 1 año y, desde el primer año, los días por año de la tabla de ley, con un máximo de 8 años.",
      "En renuncia o despido con justa causa solo se pagan vacaciones y aguinaldo proporcional.",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <DateIn label="Fecha de ingreso" value={s.ingreso} onChange={set("ingreso")} />
            <DateIn label="Fecha de salida" value={s.salida} onChange={set("salida")} />
          </div>
          <Money label="Salario promedio de los últimos 6 meses" value={s.promedio} onChange={set("promedio")} hint="Promedio bruto mensual, incluidas horas extra y comisiones." />
          <Segmented label="Motivo de salida" value={motivo} onChange={set("motivo")} options={MOTIVOS} />
          {motivo === "despido" && <Toggle label="El preaviso ya se dio trabajando" checked={s.preaviso} onChange={set("preaviso")} />}
          <Num
            label="Días de vacaciones pendientes"
            value={s.vac}
            onChange={set("vac")}
            max={120}
            step={0.5}
            hint="Se gana 1 día por cada mes trabajado (2 semanas por año). Puede calcularlos con la calculadora de vacaciones."
          />
        </>
      }
    />
  );
}

/* ─────────────────  Costo patronal  ───────────────── */

export function CalcCostoPatronal() {
  const { state: s, set, query } = useQueryState({ salario: 800_000, clase: 0, prov: true, personas: 1 }, "costo-patronal");
  const r = costoPatronal(s.salario, s.clase, s.prov);
  const n = Math.max(1, s.personas);
  const report: Report = {
    title: `Calculadora de costo patronal Costa Rica ${VIGENCIA}`,
    label: "Costo patronal",
    totalLabel: n > 1 ? `Costo mensual de ${n} colaboradores` : "Costo mensual por colaborador",
    total: r.total * n,
    inputs: [
      ["Salario bruto mensual", crc(s.salario)],
      ["Clase de riesgo INS", `${INS_CLASES[s.clase].id} (${pct(INS_CLASES[s.clase].tasa)})`],
      ["Colaboradores", String(n)],
      ["Reservas de aguinaldo y vacaciones", si(s.prov)],
    ],
    rows: [
      { label: "Salario bruto", value: s.salario },
      { label: `CCSS patronal (${pct(CCSS_PATRONO)})`, value: r.ccss, sign: "+" },
      { label: `Riesgos del trabajo INS (${pct(INS_CLASES[s.clase].tasa)})`, value: r.ins, sign: "+" },
      ...(s.prov
        ? [
            { label: "Reserva de aguinaldo (8,33 %)", value: r.aguinaldo, sign: "+" as const },
            { label: "Reserva de vacaciones (4,17 %)", value: r.vacaciones, sign: "+" as const },
          ]
        : []),
      ...(n > 1 ? [{ label: "Costo por colaborador", value: r.total, note: `× ${n} colaboradores` }] : []),
    ],
    extras: [`Cada ₡1 de salario cuesta ₡${num(r.factor)}.`, `Costo anual: ${crc(r.anual * n)}`],
    basis: [basisCcss(), `Póliza de riesgos del trabajo del INS: tarifas de referencia de ${pct(INS_CLASES[0].tasa)} a ${pct(INS_CLASES[INS_CLASES.length - 1].tasa)} según la actividad.`, "Reservas: aguinaldo 1/12 del salario y vacaciones 1/24."],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Money label="Salario bruto mensual por colaborador" value={s.salario} onChange={set("salario")} />
          <Segmented label="Clase de riesgo del INS" value={s.clase} onChange={set("clase")} options={INS_CLASES.map((c, i) => ({ value: i, label: `${c.id} · ${pct(c.tasa)}` }))} />
          <p className="-mt-3 text-[0.82rem] text-ink-muted">{INS_CLASES[s.clase].ejemplo}. La tarifa exacta depende de la actividad en su póliza.</p>
          <Num label="Cantidad de colaboradores con este salario" value={s.personas} onChange={set("personas")} max={5000} />
          <Toggle label="Incluir reservas de aguinaldo y vacaciones" checked={s.prov} onChange={set("prov")} />
        </>
      }
    />
  );
}

/* ─────────────────  Horas extra  ───────────────── */

export function CalcHorasExtra() {
  const { state: s, set, query } = useQueryState({ salario: 600_000, jornada: 0, extras: 10, fo: 0, fe: 0 }, "horas-extra");
  const j = JORNADAS[s.jornada];
  const r = horasExtra({ salario: s.salario, horasJornada: j.horas, extras: s.extras, feriadoOrdinarias: s.fo, feriadoExtras: s.fe });
  const report: Report = {
    title: `Calculadora de horas extra Costa Rica ${VIGENCIA}`,
    label: "Horas extra",
    totalLabel: "Pago adicional del periodo",
    total: r.total,
    inputs: [
      ["Salario bruto mensual", crc(s.salario)],
      ["Jornada", j.label],
      ["Horas extra en días normales", num(s.extras)],
      ["Horas ordinarias trabajadas en feriado o día de descanso", num(s.fo)],
      ["Horas extra en feriado o día de descanso", num(s.fe)],
    ],
    rows: [
      { label: "Valor de la hora ordinaria", text: crc(r.valorHora), note: `${crc0(s.salario)} ÷ 30 ÷ ${j.horas} h` },
      { label: "Horas extra (tiempo y medio)", value: r.extras, note: `${num(s.extras)} h × ${crc(r.valorHora)} × 1,5` },
      ...(s.fo ? [{ label: "Feriado o descanso trabajado", value: r.feriado, note: `${num(s.fo)} h × ${crc(r.valorHora)} (completa el pago doble)` }] : []),
      ...(s.fe ? [{ label: "Extras en feriado (triple)", value: r.feriadoExtras, note: `${num(s.fe)} h × ${crc(r.valorHora)} × 3` }] : []),
    ],
    extras: ["Las horas extra se suman al salario bruto y pagan CCSS y renta."],
    basis: [
      `Valor hora = salario mensual ÷ 30 días ÷ horas de la jornada (diurna 8, mixta 7, nocturna 6).`,
      `Horas extra: ${num(FACTOR_HE_SIMPLE)} veces el valor hora (art. 139 del Código de Trabajo). Jornada ordinaria más extras: máximo 12 horas por día.`,
      `Para salario mensual, el feriado ya está pagado: trabajarlo agrega un salario sencillo para completar el doble. Las extras en feriado se pagan a ${num(FACTOR_HE_FERIADO)} veces el valor hora.`,
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Money label="Salario bruto mensual" value={s.salario} onChange={set("salario")} />
          <Segmented label="Tipo de jornada" value={s.jornada} onChange={set("jornada")} options={JORNADAS.map((x, i) => ({ value: i, label: x.label }))} />
          <Num label="Horas extra en días normales" value={s.extras} onChange={set("extras")} step={0.5} suffix="horas" hint="Horas trabajadas después de la jornada ordinaria." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Horas ordinarias en feriado o descanso" value={s.fo} onChange={set("fo")} step={0.5} suffix="horas" />
            <Num label="Horas extra en feriado o descanso" value={s.fe} onChange={set("fe")} step={0.5} suffix="horas" />
          </div>
        </>
      }
    />
  );
}

/* ─────────────────  Vacaciones  ───────────────── */

export function CalcVacaciones() {
  const { state: s, set, query, fromUrl } = useQueryState({ ingreso: "2024-03-01", corte: "2026-10-31", disfrutados: 6, promedio: 650_000 }, "vacaciones");
  useEffect(() => {
    if (fromUrl) return;
    set("corte")(hoyIso());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);
  const r = vacaciones({ ingreso: s.ingreso, corte: s.corte, disfrutados: s.disfrutados, promedio: s.promedio });
  const report: Report = {
    title: "Calculadora de vacaciones Costa Rica",
    label: "Vacaciones",
    totalLabel: "Días de vacaciones pendientes",
    total: r.monto,
    totalText: `${num(r.pendientes)} días`,
    inputs: [
      ["Fecha de ingreso", fechaLarga(s.ingreso)],
      ["Fecha de corte", fechaLarga(s.corte)],
      ["Días ya disfrutados", num(s.disfrutados)],
      ["Salario promedio mensual", crc(s.promedio)],
    ],
    rows: [
      { label: "Meses completos laborados", text: String(Math.floor(r.meses)) },
      { label: "Días ganados", text: `${num(r.ganados)} días`, note: "1 día por cada mes completo" },
      { label: "Días disfrutados", text: `${num(s.disfrutados)} días` },
      { label: "Valor de los días pendientes", value: r.monto, note: `${num(r.pendientes)} días × ${crc(r.diario)}` },
    ],
    basis: [
      "Código de Trabajo, art. 153: 2 semanas de vacaciones pagadas por cada 50 semanas de trabajo (12 días hábiles por año).",
      "Si la relación termina antes de las 50 semanas, corresponde 1 día por cada mes trabajado (art. 153).",
      "Pago: promedio de salarios ordinarios y extraordinarios de las últimas 50 semanas (art. 157); salario diario = promedio mensual ÷ 30.",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <DateIn label="Fecha de ingreso" value={s.ingreso} onChange={set("ingreso")} />
            <DateIn label="Fecha de corte" value={s.corte} onChange={set("corte")} />
          </div>
          <Num label="Días de vacaciones ya disfrutados" value={s.disfrutados} onChange={set("disfrutados")} max={500} step={0.5} suffix="días" hint="Todos los días tomados desde el ingreso." />
          <Money label="Salario promedio mensual" value={s.promedio} onChange={set("promedio")} hint="Promedio de las últimas 50 semanas, incluidas horas extra." />
        </>
      }
    />
  );
}

