/**
 * Reglas de planilla de Costa Rica para 2026.
 * Tomadas del módulo de Odoo `planilla_cr` de A.U.R.O.M. y verificadas con la normativa vigente:
 * - Impuesto al salario: Decreto Ejecutivo 45333-H (La Gaceta 229, 5 dic 2025), rige desde el 1 ene 2026.
 * - CCSS: 10,83 % trabajador y 26,83 % patrono desde enero 2026.
 * - Preaviso y cesantía: artículos 28 y 29 del Código de Trabajo.
 * - Aguinaldo: Ley 2412; exento de renta (art. 35 LIR) y de cargas sociales.
 */

export const VIGENCIA = "2026";
export const ACTUALIZADO = "octubre de 2026";

export const TRAMOS_RENTA = [
  { desde: 0, hasta: 918_000, tasa: 0 },
  { desde: 918_000, hasta: 1_347_000, tasa: 0.1 },
  { desde: 1_347_000, hasta: 2_364_000, tasa: 0.15 },
  { desde: 2_364_000, hasta: 4_727_000, tasa: 0.2 },
  { desde: 4_727_000, hasta: Infinity, tasa: 0.25 },
] as const;

/** Personas físicas con actividad lucrativa (renta neta anual). */
export const TRAMOS_LUCRATIVA = [
  { desde: 0, hasta: 6_244_000, tasa: 0 },
  { desde: 6_244_000, hasta: 8_329_000, tasa: 0.1 },
  { desde: 8_329_000, hasta: 10_414_000, tasa: 0.15 },
  { desde: 10_414_000, hasta: 20_872_000, tasa: 0.2 },
  { desde: 20_872_000, hasta: Infinity, tasa: 0.25 },
] as const;
export const CREDITO_HIJO_ANUAL = 20_520;
export const CREDITO_CONYUGE_ANUAL = 31_080;

/** Personas jurídicas (pymes) con renta bruta anual de hasta ₡119.174.000; por encima, 30 %. */
export const TRAMOS_JURIDICAS = [
  { desde: 0, hasta: 5_621_000, tasa: 0.05 },
  { desde: 5_621_000, hasta: 8_433_000, tasa: 0.1 },
  { desde: 8_433_000, hasta: 11_243_000, tasa: 0.15 },
  { desde: 11_243_000, hasta: Infinity, tasa: 0.2 },
] as const;
export const UMBRAL_PYME = 119_174_000;
export const TARIFA_GENERAL_JURIDICAS = 0.3;

export const CREDITO_HIJO = 1_710;
export const CREDITO_CONYUGE = 2_590;

export const CCSS_TRABAJADOR = 0.1083;
export const CCSS_TRABAJADOR_DETALLE = [
  { nombre: "Seguro de Salud (SEM)", tasa: 0.055 },
  { nombre: "Invalidez, Vejez y Muerte (IVM)", tasa: 0.0433 },
  { nombre: "Banco Popular (LPT)", tasa: 0.01 },
];
export const CCSS_PATRONO = 0.2683;

export const INS_CLASES = [
  { id: "I", tasa: 0.0087, ejemplo: "Oficinas, servicios profesionales" },
  { id: "II", tasa: 0.0149, ejemplo: "Comercio, ventas, bodegas livianas" },
  { id: "III", tasa: 0.0247, ejemplo: "Manufactura liviana, transporte" },
  { id: "IV", tasa: 0.0413, ejemplo: "Industria, mantenimiento, agricultura" },
  { id: "V", tasa: 0.0688, ejemplo: "Construcción y trabajos de alto riesgo" },
] as const;

export const PROV_AGUINALDO = 1 / 12;
export const PROV_VACACIONES = 1 / 24; // 12 días hábiles (2 semanas) por año
export const DIAS_MES = 30;
export const HORAS_JORNADA = 8;
export const FACTOR_HE_SIMPLE = 1.5;
export const FACTOR_HE_DOBLE = 2;

/** Art. 29 CT: días de cesantía por año según la antigüedad total. */
export const CESANTIA_TABLA: { anios: string; dias: number }[] = [
  { anios: "1 año", dias: 19.5 },
  { anios: "2 años", dias: 20 },
  { anios: "3 años", dias: 20.5 },
  { anios: "4 años", dias: 21 },
  { anios: "5 años", dias: 21.24 },
  { anios: "6 años", dias: 21.5 },
  { anios: "7 a 9 años", dias: 22 },
  { anios: "10 años", dias: 21.5 },
  { anios: "11 años", dias: 21 },
  { anios: "12 años", dias: 20.5 },
  { anios: "13 años o más", dias: 20 },
];
const CESANTIA_POR_ANIO = [0, 19.5, 20, 20.5, 21, 21.24, 21.5, 22, 22, 22, 21.5, 21, 20.5];
export const CESANTIA_MAX_ANIOS = 8;

export const r2 = (n: number) => Math.round(n * 100) / 100;

/** Formato usado en Costa Rica: ₡1.234.567,89 */
export const miles = (n: number, dec = 0) => {
  const [ent, frac] = Math.abs(n).toFixed(dec).split(".");
  return (n < 0 ? "-" : "") + ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (frac ? "," + frac : "");
};
export const crc = (n: number) => "₡" + miles(n, 2);

export const pct = (n: number) => (n * 100).toLocaleString("es-CR", { maximumFractionDigits: 2 }) + " %";

/* ─────────────────  Salario neto  ───────────────── */

export function impuestoRenta(brutoMensual: number, hijos = 0, conyuge = false) {
  const detalle = TRAMOS_RENTA.map((t) => {
    const base = Math.max(0, Math.min(brutoMensual, t.hasta) - t.desde);
    return { ...t, base, impuesto: base * t.tasa };
  });
  const bruto = detalle.reduce((a, d) => a + d.impuesto, 0);
  const creditos = bruto > 0 ? hijos * CREDITO_HIJO + (conyuge ? CREDITO_CONYUGE : 0) : 0;
  return { detalle, bruto, creditos: Math.min(creditos, bruto), total: Math.max(0, bruto - creditos) };
}

export function salarioNeto(input: { salario: number; heSimples: number; heDobles: number; otros: number; hijos: number; conyuge: boolean }) {
  const valorHora = input.salario / DIAS_MES / HORAS_JORNADA;
  const extras = valorHora * (input.heSimples * FACTOR_HE_SIMPLE + input.heDobles * FACTOR_HE_DOBLE);
  const bruto = input.salario + extras + input.otros;
  const ccss = bruto * CCSS_TRABAJADOR;
  const renta = impuestoRenta(bruto, input.hijos, input.conyuge);
  const neto = bruto - ccss - renta.total;
  return { valorHora, extras, bruto, ccss, renta, neto, quincena: neto / 2 };
}

/* ─────────────────  Aguinaldo  ───────────────── */

export function aguinaldo(salarios: number[]) {
  const total = salarios.reduce((a, b) => a + (b || 0), 0);
  return { total, aguinaldo: total / 12 };
}

/* ─────────────────  Liquidación  ───────────────── */

export type Motivo = "despido" | "renuncia" | "justa-causa";

/** Meses (con fracción) entre dos fechas ISO. */
export function mesesEntre(desde: string, hasta: string) {
  const a = new Date(desde + "T00:00:00");
  const b = new Date(hasta + "T00:00:00");
  if (isNaN(+a) || isNaN(+b) || b < a) return 0;
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  let d = b.getDate() - a.getDate() + 1;
  if (d < 0) {
    m -= 1;
    d += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  const dim = new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate();
  return Math.max(0, m + (d >= dim ? 1 : d / 30));
}

export function diasPreaviso(meses: number) {
  if (meses < 3) return 0;
  if (meses < 6) return 7;
  if (meses < 12) return 15;
  return 30;
}

export function diasCesantia(meses: number) {
  if (meses < 3) return 0;
  if (meses < 6) return 7;
  if (meses < 12) return 14;
  const anios = meses / 12;
  const completos = Math.floor(anios);
  const porAnio = CESANTIA_POR_ANIO[Math.min(completos, 12)] ?? 20;
  return porAnio * Math.min(anios, CESANTIA_MAX_ANIOS);
}

export function liquidacion(input: {
  ingreso: string;
  salida: string;
  promedio: number;
  motivo: Motivo;
  preavisoOtorgado: boolean;
  vacacionesPendientes: number;
  salariosDesdeDiciembre: number;
}) {
  const meses = mesesEntre(input.ingreso, input.salida);
  const diario = input.promedio / DIAS_MES;
  const conDerechos = input.motivo === "despido";
  const dPreaviso = conDerechos && !input.preavisoOtorgado ? diasPreaviso(meses) : 0;
  const dCesantia = conDerechos ? diasCesantia(meses) : 0;
  const preaviso = dPreaviso * diario;
  const cesantia = dCesantia * diario;
  const vacaciones = input.vacacionesPendientes * diario;
  const aguinaldoProp = input.salariosDesdeDiciembre / 12;
  return {
    meses,
    diario,
    dPreaviso,
    dCesantia,
    preaviso,
    cesantia,
    vacaciones,
    aguinaldo: aguinaldoProp,
    total: preaviso + cesantia + vacaciones + aguinaldoProp,
  };
}

/** Suma estimada de salarios desde el 1 de diciembre anterior (o desde el ingreso) hasta la salida. */
export function salariosDesdeDiciembre(ingreso: string, salida: string, salario: number) {
  const b = new Date(salida + "T00:00:00");
  if (isNaN(+b)) return 0;
  const dic = new Date(b.getMonth() === 11 ? b.getFullYear() : b.getFullYear() - 1, 11, 1);
  const desde = new Date(ingreso + "T00:00:00") > dic ? ingreso : `${dic.getFullYear()}-12-01`;
  return mesesEntre(desde, salida) * salario;
}

/* ─────────────────  Costo patronal  ───────────────── */

export function costoPatronal(salario: number, claseIns: number, provisiones: boolean) {
  const ccss = salario * CCSS_PATRONO;
  const ins = salario * INS_CLASES[claseIns].tasa;
  const agui = provisiones ? salario * PROV_AGUINALDO : 0;
  const vac = provisiones ? salario * PROV_VACACIONES : 0;
  const total = salario + ccss + ins + agui + vac;
  return { ccss, ins, aguinaldo: agui, vacaciones: vac, total, anual: total * 12, factor: total / salario };
}
