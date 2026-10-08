"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  CATEGORIAS,
  CCSS_PATRONO,
  CCSS_TRABAJADOR,
  FERIADOS,
  HORAS_MES_REALES,
  OCUPACIONES,
  TIPOLOGIAS,
  VIGENCIA,
  ahorroAutomatizacion,
  costoConstruccion,
  crc,
  crc0,
  datos,
  diaSemana,
  fechaLarga,
  hoyIso,
  mensualDeCategoria,
  num,
  pagoFeriado,
  pct,
  salarioNeto,
} from "@/lib/planilla";
import type { Report } from "./report";
import { Layout, Money, Num, Segmented, Select, Toggle, inputCls } from "./ui";
import { useQueryState } from "./useQueryState";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ─────────────────  Salario mínimo por ocupación  ───────────────── */

export function CalcSalarioMinimo() {
  const peon = OCUPACIONES.findIndex((o) => o.nombre === "Peón de construcción");
  const { state: s, set, query } = useQueryState({ occ: peon, cat: 0 }, "salario-minimo");
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return OCUPACIONES.map((o, i) => ({ ...o, i })).filter((o) => norm(o.nombre).includes(t)).slice(0, 8);
  }, [q]);

  const ocup = s.occ >= 0 ? OCUPACIONES[s.occ] : null;
  const cat = ocup ? CATEGORIAS.find((c) => c.codigo === ocup.codigo)! : CATEGORIAS[s.cat];
  const mensual = mensualDeCategoria(cat);
  const neto = salarioNeto({ salario: mensual, heSimples: 0, heDobles: 0, otros: 0, hijos: 0, conyuge: false });
  const report: Report = {
    title: `Salario mínimo ${VIGENCIA} en Costa Rica: ${ocup ? ocup.nombre : cat.nombre}`,
    label: "Salario mínimo",
    totalLabel: "Salario mínimo mensual",
    total: mensual,
    inputs: [
      ...(ocup ? [["Ocupación", ocup.nombre] as [string, string]] : []),
      ["Categoría", `${cat.nombre} (${cat.codigo})`],
    ],
    rows: [
      { label: cat.unidad === "jornada" ? "Mínimo por jornada ordinaria" : "Mínimo mensual", value: cat.monto },
      ...(cat.unidad === "jornada" ? [{ label: "Equivalente mensual", value: mensual, note: `${crc(cat.monto)} × 30 días` }] : []),
      { label: `CCSS trabajador (${pct(CCSS_TRABAJADOR)})`, value: neto.ccss, sign: "-" },
      { label: "Impuesto sobre la renta", value: neto.renta.total, sign: "-", note: neto.renta.total ? undefined : "Exento" },
      { label: "Salario neto aproximado", value: neto.neto },
    ],
    basis: [
      `${datos.salario_minimo.decreto}. Rige desde el 1 de enero de ${VIGENCIA}. Aumento: ${datos.salario_minimo.aumento}.`,
      "La categoría depende de las funciones reales del puesto según los perfiles ocupacionales del MTSS; la ocupación es una guía.",
      "Los mínimos por jornada se multiplican por 30 para obtener el mensual.",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <div className="grid gap-1.5">
            <label htmlFor="buscar-ocupacion" className="text-[0.92rem] font-semibold">
              Busque su ocupación
            </label>
            <div className="relative">
              <MagnifyingGlassIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input
                id="buscar-ocupacion"
                type="search"
                autoComplete="off"
                placeholder="Ej.: albañil, cajero, chofer, misceláneo…"
                className={`${inputCls} pl-11`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {q.trim() && (
              <ul className="mt-1 grid gap-1 rounded-sm border border-line bg-bg p-1.5" role="listbox" aria-label="Ocupaciones encontradas">
                {matches.length === 0 && <li className="px-3 py-2 text-[0.92rem] text-ink-muted">No la encontramos. Elija la categoría más parecida abajo.</li>}
                {matches.map((m) => (
                  <li key={m.i}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={s.occ === m.i}
                      onClick={() => {
                        set("occ")(m.i);
                        setQ("");
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-[0.95rem] hover:bg-surface"
                    >
                      {m.nombre}
                      <span className="font-mono text-[0.8rem] text-ink-muted">{m.codigo}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {ocup && (
            <p className="rounded-sm bg-surface-2/60 px-4 py-3 text-[0.95rem]">
              <strong>{ocup.nombre}</strong> corresponde a <strong>{cat.nombre}</strong> ({cat.codigo}).
            </p>
          )}
          <Select
            label="O elija la categoría directamente"
            value={ocup ? CATEGORIAS.indexOf(cat) : s.cat}
            onChange={(i) => {
              set("occ")(-1);
              set("cat")(i);
            }}
            options={CATEGORIAS.map((c) => `${c.nombre} (${c.codigo})`)}
          />
          <a href={`/calculadoras/salario-neto-costa-rica?salario=${Math.round(mensual)}`} className="text-[0.95rem] font-semibold text-accent-text underline-offset-4 hover:underline">
            Calcular el salario neto con horas extra y créditos →
          </a>
        </>
      }
    />
  );
}

/* ─────────────────  Feriados  ───────────────── */

export function ProximoFeriado() {
  const [hoy, setHoy] = useState<string | null>(null);
  useEffect(() => setHoy(hoyIso()), []);
  if (!hoy) return <div className="h-[8.5rem] rounded-lg border border-line bg-surface" aria-hidden />;
  const prox = FERIADOS.find((f) => f.fecha >= hoy);
  if (!prox) return null;
  const dias = Math.round((+new Date(prox.fecha + "T00:00:00") - +new Date(hoy + "T00:00:00")) / 86400000);
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-line bg-surface p-6 md:p-8">
      <div>
        <p className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-accent-text">Próximo feriado</p>
        <p className="mt-2 font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold leading-tight">{prox.nombre}</p>
        <p className="mt-1 text-ink-muted">
          {diaSemana(prox.fecha)} {fechaLarga(prox.fecha)} · {prox.obligatorio ? "pago obligatorio" : "pago no obligatorio"}
        </p>
      </div>
      <p className="font-display text-[clamp(2.4rem,6vw,4rem)] font-bold tabular-nums leading-none text-accent">
        {dias === 0 ? "¡Hoy!" : dias}
        {dias > 0 && <span className="ml-2 font-sans text-lg font-semibold text-ink-muted">{dias === 1 ? "día" : "días"}</span>}
      </p>
    </div>
  );
}

export function CalcFeriado() {
  const { state: s, set, query } = useQueryState({ tipo: "mensual", salario: 600_000, obligatorio: true, horas: 8, jornada: 8 }, "feriados");
  const tipo = s.tipo as "mensual" | "semanal";
  const r = pagoFeriado({ tipo, salario: s.salario, obligatorio: s.obligatorio, horas: s.horas, horasJornada: s.jornada });
  const report: Report = {
    title: "Pago por trabajar un feriado en Costa Rica",
    label: "Pago de feriado",
    totalLabel: "Monto adicional a pagar",
    total: r.adicional,
    inputs: [
      ["Forma de pago", tipo === "mensual" ? "Mensual o quincenal" : "Semanal (por día)"],
      [tipo === "mensual" ? "Salario mensual" : "Salario diario", crc(s.salario)],
      ["Feriado de pago obligatorio", s.obligatorio ? "Sí" : "No"],
      ["Horas trabajadas en el feriado", `${num(s.horas)} de ${num(s.jornada)}`],
    ],
    rows: [
      { label: "Salario diario", value: r.diario, note: tipo === "mensual" ? `${crc0(s.salario)} ÷ 30` : undefined },
      {
        label: tipo === "mensual" ? "Ya incluido en el salario mensual" : s.obligatorio ? "Feriado obligatorio trabajado" : "Feriado no obligatorio trabajado",
        text: `× ${r.factor}${s.horas < s.jornada ? ` × ${num(s.horas)}/${num(s.jornada)} h` : ""}`,
        note: tipo === "mensual" ? "Se agrega un salario sencillo para completar el pago doble" : s.obligatorio ? "Se paga doble" : "Se paga sencillo",
      },
      { label: "Adicional del feriado", value: r.adicional },
    ],
    basis: [
      "Código de Trabajo, art. 148 (feriados), 149 y 152: quien trabaja un feriado recibe el doble del salario ordinario.",
      "Salario mensual o quincenal: los feriados ya están incluidos; trabajarlo agrega un salario sencillo adicional.",
      "Salario semanal: feriado obligatorio trabajado se paga doble; feriado no obligatorio trabajado se paga sencillo.",
      "Horas extra en feriado: tiempo y medio doble (triple).",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Segmented
            label="¿Cómo recibe el salario?"
            value={tipo}
            onChange={set("tipo")}
            options={[
              { value: "mensual", label: "Mensual o quincenal" },
              { value: "semanal", label: "Semanal (por día)" },
            ]}
          />
          <Money label={tipo === "mensual" ? "Salario bruto mensual" : "Salario diario"} value={s.salario} onChange={set("salario")} />
          <Toggle label="Es un feriado de pago obligatorio" checked={s.obligatorio} onChange={set("obligatorio")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Horas trabajadas en el feriado" value={s.horas} onChange={set("horas")} max={12} step={0.5} suffix="horas" />
            <Num label="Horas de su jornada ordinaria" value={s.jornada} onChange={set("jornada")} max={12} suffix="horas" />
          </div>
        </>
      }
    />
  );
}

/* ─────────────────  Costo de construcción  ───────────────── */

export function CalcConstruccion() {
  const { state: s, set, query } = useQueryState({ tip: 2, area: 120, ajuste: 0, imprevistos: 10 }, "construccion");
  const r = costoConstruccion({ tipologia: s.tip, area: s.area, ajuste: s.ajuste, imprevistos: s.imprevistos });
  const report: Report = {
    title: `Costo de construcción por m² en Costa Rica ${VIGENCIA}`,
    label: "Costo de construcción",
    totalLabel: `Costo estimado de ${num(s.area)} m²`,
    total: r.total,
    inputs: [
      ["Tipo de construcción", `${r.t.nombre} (${r.t.codigo})`],
      ["Área", `${num(s.area)} m²`],
      ["Ajuste de precio", `${num(s.ajuste)} %`],
      ["Imprevistos", `${num(s.imprevistos)} %`],
    ],
    rows: [
      { label: "Valor de referencia por m²", value: r.t.valor, note: `Tipología ${r.t.codigo} · área típica ${r.t.area}` },
      { label: "Construcción base", value: r.base, note: `${num(s.area)} m² × ${crc0(r.t.valor)}` },
      ...(s.ajuste ? [{ label: `Ajuste de precio (${num(s.ajuste)} %)`, value: r.ajuste, sign: "+" as const }] : []),
      ...(s.imprevistos ? [{ label: `Imprevistos (${num(s.imprevistos)} %)`, value: r.imprevistos, sign: "+" as const }] : []),
    ],
    extras: [`Costo final por m²: ${crc(r.porM2)}`],
    basis: [
      `Valores de referencia: ${datos.construccion.fuente_texto}. Son valores fiscales de reposición (solo la construcción, sin terreno).`,
      "Los precios de mercado de 2026 suelen ser mayores; use el ajuste de precio para reflejar la cotización de su constructor.",
      "No incluye terreno, permisos, planos, dirección técnica, impuestos ni obras externas (tapias, aceras, piscina).",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <Select
            label="Tipo de construcción"
            value={s.tip}
            onChange={set("tip")}
            options={TIPOLOGIAS.map((t) => `${t.nombre} · ${crc0(t.valor)}/m²`)}
            hint={`Área típica de esta tipología: ${TIPOLOGIAS[s.tip].area}.`}
          />
          <Num label="Área a construir" value={s.area} onChange={set("area")} max={100000} suffix="m²" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Ajuste de precio" value={s.ajuste} onChange={set("ajuste")} max={300} suffix="%" hint="Opcional: inflación o precios de su zona." />
            <Num label="Imprevistos" value={s.imprevistos} onChange={set("imprevistos")} max={50} suffix="%" hint="Se recomienda entre 10 % y 15 %." />
          </div>
        </>
      }
    />
  );
}

/* ─────────────────  Ahorro por automatización  ───────────────── */

export function CalcAhorro() {
  const { state: s, set, query } = useQueryState({ personas: 3, horas: 10, salario: 650_000, porcentaje: 70 }, "ahorro-automatizacion");
  const r = ahorroAutomatizacion({ personas: s.personas, horasSemana: s.horas, salario: s.salario, porcentaje: s.porcentaje });
  const report: Report = {
    title: "Calculadora de ahorro por automatización de procesos",
    label: "Ahorro por automatizar",
    totalLabel: "Ahorro estimado al año",
    total: r.ahorroAnio,
    inputs: [
      ["Personas que hacen la tarea", String(s.personas)],
      ["Horas por semana, por persona", num(s.horas)],
      ["Salario mensual promedio", crc(s.salario)],
      ["Parte que se puede automatizar", `${num(s.porcentaje)} %`],
    ],
    rows: [
      { label: "Costo real de una hora de trabajo", value: r.costoHora, note: `Salario × ${num(r.factor)} (cargas sociales y reservas) ÷ ${num(HORAS_MES_REALES, 0)} h` },
      { label: "Horas al mes en la tarea", text: `${num(r.horasMes, 1)} h` },
      { label: "Lo que cuesta hoy la tarea", value: r.costoAnio, note: `${crc0(r.costoMes)} al mes` },
      { label: "Ahorro mensual", value: r.ahorroMes },
    ],
    extras: [`Horas que su equipo recupera al año: ${num(r.horasLiberadasAnio, 0)}`],
    basis: [
      `Costo de una hora = salario mensual × (1 + CCSS patronal ${pct(CCSS_PATRONO)} + INS + reservas de aguinaldo y vacaciones) ÷ ${num(HORAS_MES_REALES, 0)} horas efectivas al mes.`,
      "Horas al mes = personas × horas por semana × 52 ÷ 12.",
      "Es una estimación del tiempo que se libera; no incluye el costo de la automatización.",
    ],
  };
  return (
    <Layout
      query={query}
      report={report}
      form={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Num label="Personas que hacen la tarea" value={s.personas} onChange={set("personas")} max={1000} />
            <Num label="Horas por semana, por persona" value={s.horas} onChange={set("horas")} max={48} step={0.5} suffix="horas" />
          </div>
          <Money label="Salario mensual promedio de esas personas" value={s.salario} onChange={set("salario")} />
          <Num label="Parte de la tarea que se puede automatizar" value={s.porcentaje} onChange={set("porcentaje")} max={100} suffix="%" hint="Copiar datos, revisar correos o armar reportes suele automatizarse entre 60 % y 90 %." />
        </>
      }
    />
  );
}
