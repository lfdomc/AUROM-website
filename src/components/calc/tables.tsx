/** Tablas de datos oficiales. Se generan en el servidor: el texto queda en el HTML y Google lo indexa. */
import {
  CATEGORIAS,
  CCSS_PATRONO,
  CCSS_TRABAJADOR,
  CCSS_TRABAJADOR_DETALLE,
  CESANTIA_TABLA,
  CREDITO_CONYUGE,
  CREDITO_CONYUGE_ANUAL,
  CREDITO_HIJO,
  CREDITO_HIJO_ANUAL,
  FERIADOS,
  INS_CLASES,
  JORNADAS,
  OCUPACIONES,
  TARIFA_GENERAL_JURIDICAS,
  TIPOLOGIAS,
  TRAMOS_JURIDICAS,
  TRAMOS_LUCRATIVA,
  TRAMOS_RENTA,
  UMBRAL_PYME,
  VIGENCIA,
  crc,
  crc0,
  diaSemana,
  fechaLarga,
  mensualDeCategoria,
  num,
  pct,
  type Tramo,
} from "@/lib/planilla";
import { DataTable } from "./DataTable";

const filasTramos = (t: Tramo[], exento = true) =>
  t.map((x, i) => [
    i === 0 ? `Hasta ${crc0(x.hasta)}` : x.hasta === Infinity ? `Exceso de ${crc0(x.desde)}` : `Exceso de ${crc0(x.desde)} y hasta ${crc0(x.hasta)}`,
    x.tasa === 0 && exento ? "Exento" : pct(x.tasa),
  ]);

export const TablaRenta = () => <DataTable caption={`Impuesto al salario ${VIGENCIA}: asalariados y pensionados (mensual)`} head={["Salario mensual", "Tarifa"]} rows={filasTramos(TRAMOS_RENTA)} />;

export const TablaCreditos = () => (
  <DataTable
    caption={`Créditos fiscales ${VIGENCIA} (se restan del impuesto)`}
    head={["Crédito", "Monto mensual"]}
    rows={[
      ["Por cada hijo", crc0(CREDITO_HIJO)],
      ["Por cónyuge", crc0(CREDITO_CONYUGE)],
    ]}
  />
);

export const TablaCcss = () => (
  <DataTable
    caption={`Cargas sociales CCSS ${VIGENCIA}`}
    head={["Concepto", "Porcentaje"]}
    rows={[...CCSS_TRABAJADOR_DETALLE.map((d) => [`Trabajador: ${d.nombre}`, pct(d.tasa)]), ["Total que se rebaja al trabajador", pct(CCSS_TRABAJADOR)], ["Total que paga el patrono", pct(CCSS_PATRONO)]]}
  />
);

export const TablaLucrativa = () => (
  <DataTable
    caption={`Actividad lucrativa ${VIGENCIA}: personas físicas (renta neta anual)`}
    head={["Renta neta anual", "Tarifa"]}
    rows={[...filasTramos(TRAMOS_LUCRATIVA), ["Crédito anual por hijo / por cónyuge", `${crc0(CREDITO_HIJO_ANUAL)} / ${crc0(CREDITO_CONYUGE_ANUAL)}`]]}
  />
);

export const TablaJuridicas = () => (
  <DataTable
    caption={`Personas jurídicas ${VIGENCIA} con renta bruta hasta ${crc0(UMBRAL_PYME)} (anual)`}
    head={["Renta neta anual", "Tarifa"]}
    rows={[...filasTramos(TRAMOS_JURIDICAS, false), [`Renta bruta mayor a ${crc0(UMBRAL_PYME)}`, `${pct(TARIFA_GENERAL_JURIDICAS)} (tarifa general)`]]}
  />
);

export const TablaPreaviso = () => (
  <DataTable
    caption="Preaviso (artículo 28 del Código de Trabajo)"
    head={["Tiempo laborado", "Preaviso"]}
    rows={[
      ["Menos de 3 meses", "No corresponde"],
      ["De 3 a 6 meses", "1 semana (7 días)"],
      ["De 6 meses a 1 año", "15 días"],
      ["Más de 1 año", "1 mes (30 días)"],
    ]}
  />
);

export const TablaCesantia = () => (
  <DataTable
    caption="Cesantía (artículo 29 del Código de Trabajo)"
    head={["Antigüedad", "Días de salario"]}
    rows={[["Menos de 3 meses", "No corresponde"], ["De 3 a 6 meses", "7 días"], ["De 6 meses a 1 año", "14 días"], ...CESANTIA_TABLA.map((c) => [c.anios, `${num(c.dias)} días por año`])]}
  />
);

export const TablaPatronal = () => (
  <DataTable caption={`Riesgos del trabajo (INS): tarifas de referencia ${VIGENCIA}`} head={["Clase", "Tarifa", "Actividades típicas"]} rows={INS_CLASES.map((c) => [`Clase ${c.id}`, pct(c.tasa), c.ejemplo])} />
);

export const TablaHorasExtra = () => (
  <DataTable
    caption="Cómo se pagan las horas extra"
    head={["Situación", "Pago"]}
    mono={false}
    rows={[
      ["Hora extra en día normal", "Tiempo y medio (1,5 × valor hora)"],
      ["Feriado o día de descanso trabajado (salario mensual)", "Un salario sencillo adicional (completa el doble)"],
      ["Hora extra en feriado o día de descanso", "Tiempo y medio doble (3 × valor hora)"],
      ...JORNADAS.map((j) => [`Jornada ${j.label.toLowerCase()}`, `Valor hora = salario ÷ 30 ÷ ${j.horas}`]),
    ]}
  />
);

export const TablaSalarioMinimo = () => (
  <DataTable
    caption={`Salarios mínimos ${VIGENCIA} en Costa Rica (sector privado)`}
    head={["Categoría", "Mínimo", "Mensual"]}
    rows={CATEGORIAS.map((c) => [`${c.nombre} (${c.codigo})`, `${crc(c.monto)} ${c.unidad === "jornada" ? "por jornada" : "por mes"}`, crc(mensualDeCategoria(c))])}
  />
);

export const TablaOcupaciones = () => (
  <DataTable
    caption={`Salario mínimo ${VIGENCIA} por ocupación`}
    head={["Ocupación", "Categoría", "Mínimo mensual"]}
    rows={[...OCUPACIONES]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      .map((o) => {
        const c = CATEGORIAS.find((x) => x.codigo === o.codigo)!;
        return [o.nombre, c.codigo, crc(mensualDeCategoria(c))];
      })}
  />
);

export const TablaFeriados = ({ anio }: { anio: string }) => (
  <DataTable
    caption={`Feriados ${anio} en Costa Rica`}
    head={["Fecha", "Feriado", "Pago"]}
    mono={false}
    rows={FERIADOS.filter((f) => f.fecha.startsWith(anio)).map((f) => [`${diaSemana(f.fecha)} ${fechaLarga(f.fecha).replace(` de ${anio}`, "")}`, f.nombre, f.obligatorio ? "Obligatorio" : "No obligatorio"])}
  />
);

export const TablaTipologias = () => (
  <DataTable
    caption="Valores de referencia por m² (Hacienda, tipologías constructivas)"
    head={["Tipología", "Área típica", "₡ por m²"]}
    rows={TIPOLOGIAS.map((t) => [`${t.nombre} (${t.codigo})`, t.area, crc0(t.valor)])}
  />
);

export const TABLES = {
  "salario-neto": [TablaRenta, TablaCreditos, TablaCcss, TablaLucrativa, TablaJuridicas],
  aguinaldo: [],
  liquidacion: [TablaPreaviso, TablaCesantia],
  "costo-patronal": [TablaPatronal, TablaCcss],
  "horas-extra": [TablaHorasExtra],
  vacaciones: [],
  "salario-minimo": [TablaSalarioMinimo, TablaOcupaciones],
  feriados: [() => <TablaFeriados anio="2026" />, () => <TablaFeriados anio="2027" />],
  construccion: [TablaTipologias],
  "ahorro-automatizacion": [],
} as const;
