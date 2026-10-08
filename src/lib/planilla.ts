/**
 * Reglas y fórmulas de las calculadoras de Costa Rica.
 * Los NÚMEROS están en content/datos-cr.json (tramos, CCSS, salarios mínimos, feriados, costos por m²).
 * Aquí solo están las fórmulas, tomadas del módulo de Odoo `planilla_cr` de A.U.R.O.M. y del Código de Trabajo.
 */
import datos from "../../content/datos-cr.json";

export { datos };

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
export const VIGENCIA = datos.vigencia;
export const ACTUALIZADO = (() => {
  const [y, m] = datos.actualizado.split("-").map(Number);
  return `${MESES[m - 1]} de ${y}`;
})();

export type Tramo = { desde: number; hasta: number; tasa: number };
const tramos = (t: (number | null)[][]): Tramo[] => t.map(([desde, hasta, tasa]) => ({ desde: desde!, hasta: hasta ?? Infinity, tasa: tasa! }));

export const TRAMOS_RENTA = tramos(datos.renta.asalariados_mensual);
export const TRAMOS_LUCRATIVA = tramos(datos.renta.lucrativa_anual);
export const TRAMOS_JURIDICAS = tramos(datos.renta.juridicas_anual);
export const CREDITO_HIJO = datos.renta.credito_hijo_mensual;
export const CREDITO_CONYUGE = datos.renta.credito_conyuge_mensual;
export const CREDITO_HIJO_ANUAL = datos.renta.credito_hijo_anual;
export const CREDITO_CONYUGE_ANUAL = datos.renta.credito_conyuge_anual;
export const UMBRAL_PYME = datos.renta.umbral_pyme;
export const TARIFA_GENERAL_JURIDICAS = datos.renta.tarifa_general_juridicas;

export const CCSS_TRABAJADOR = datos.ccss.trabajador;
export const CCSS_TRABAJADOR_DETALLE = datos.ccss.trabajador_detalle.map(([nombre, tasa]) => ({ nombre: nombre as string, tasa: tasa as number }));
export const CCSS_PATRONO = datos.ccss.patrono;

export const INS_CLASES = datos.ins_clases.map(([id, tasa, ejemplo]) => ({ id: id as string, tasa: tasa as number, ejemplo: ejemplo as string }));

export const PROV_AGUINALDO = 1 / 12;
export const PROV_VACACIONES = 1 / 24;
export const DIAS_MES = datos.jornada.dias_mes;
export const HORAS_JORNADA = datos.jornada.horas_dia;
export const FACTOR_HE_SIMPLE = datos.jornada.he_sencilla;
export const FACTOR_HE_DOBLE = datos.jornada.he_doble;
export const FACTOR_HE_FERIADO = datos.jornada.he_feriado;

const CESANTIA_POR_ANIO = datos.cesantia_por_anio;
export const CESANTIA_MAX_ANIOS = datos.cesantia_max_anios;
export const CESANTIA_TABLA = [
  { anios: "1 año", dias: CESANTIA_POR_ANIO[1] },
  { anios: "2 años", dias: CESANTIA_POR_ANIO[2] },
  { anios: "3 años", dias: CESANTIA_POR_ANIO[3] },
  { anios: "4 años", dias: CESANTIA_POR_ANIO[4] },
  { anios: "5 años", dias: CESANTIA_POR_ANIO[5] },
  { anios: "6 años", dias: CESANTIA_POR_ANIO[6] },
  { anios: "7 a 9 años", dias: CESANTIA_POR_ANIO[7] },
  { anios: "10 años", dias: CESANTIA_POR_ANIO[10] },
  { anios: "11 años", dias: CESANTIA_POR_ANIO[11] },
  { anios: "12 años", dias: CESANTIA_POR_ANIO[12] },
  { anios: "13 años o más", dias: CESANTIA_POR_ANIO[13] },
];

export type Fuente = { label: string; url: string };

/* ─────────────────  Formato  ───────────────── */

/** Formato usado en Costa Rica: 1.234.567,89 */
export const miles = (n: number, dec = 0) => {
  const [ent, frac] = Math.abs(n).toFixed(dec).split(".");
  return (n < 0 ? "-" : "") + ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (frac ? "," + frac : "");
};
export const crc = (n: number) => "₡" + miles(n, 2);
export const crc0 = (n: number) => "₡" + miles(n);
export const num = (n: number, dec = 2) => {
  const s = miles(n, dec);
  return dec ? s.replace(/,?0+$/, "") : s;
};
export const pct = (n: number) => num(n * 100, 2) + " %";

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

export const valorHora = (salarioMensual: number, horasJornada = HORAS_JORNADA) => salarioMensual / DIAS_MES / horasJornada;

export function salarioNeto(input: { salario: number; heSimples: number; heDobles: number; otros: number; hijos: number; conyuge: boolean }) {
  const vh = valorHora(input.salario);
  const extras = vh * (input.heSimples * FACTOR_HE_SIMPLE + input.heDobles * FACTOR_HE_DOBLE);
  const bruto = input.salario + extras + input.otros;
  const ccss = bruto * CCSS_TRABAJADOR;
  const renta = impuestoRenta(bruto, input.hijos, input.conyuge);
  const neto = bruto - ccss - renta.total;
  return { valorHora: vh, extras, bruto, ccss, renta, neto, quincena: neto / 2 };
}

/* ─────────────────  Aguinaldo  ───────────────── */

export function aguinaldo(salarios: number[]) {
  const total = salarios.reduce((a, b) => a + (b || 0), 0);
  return { total, aguinaldo: total / 12 };
}

/* ─────────────────  Fechas  ───────────────── */

/** Meses (con fracción) entre dos fechas ISO, contando ambos días. */
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

export const fechaLarga = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(+d)) return iso;
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

export const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ─────────────────  Liquidación  ───────────────── */

export type Motivo = "despido" | "renuncia" | "justa-causa";

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
  const porAnio = CESANTIA_POR_ANIO[Math.min(completos, CESANTIA_POR_ANIO.length - 1)];
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
  return { meses, diario, dPreaviso, dCesantia, preaviso, cesantia, vacaciones, aguinaldo: aguinaldoProp, total: preaviso + cesantia + vacaciones + aguinaldoProp };
}

/** Suma estimada de salarios desde el 1 de diciembre anterior (o desde el ingreso) hasta la salida. */
export function salariosDesdeDiciembre(ingreso: string, salida: string, salario: number) {
  const b = new Date(salida + "T00:00:00");
  if (isNaN(+b)) return 0;
  const anioDic = b.getMonth() === 11 ? b.getFullYear() : b.getFullYear() - 1;
  const dic = new Date(anioDic, 11, 1);
  const desde = new Date(ingreso + "T00:00:00") > dic ? ingreso : `${anioDic}-12-01`;
  return mesesEntre(desde, salida) * salario;
}

/* ─────────────────  Costo patronal  ───────────────── */

export function costoPatronal(salario: number, claseIns: number, provisiones: boolean) {
  const ccss = salario * CCSS_PATRONO;
  const ins = salario * INS_CLASES[claseIns].tasa;
  const agui = provisiones ? salario * PROV_AGUINALDO : 0;
  const vac = provisiones ? salario * PROV_VACACIONES : 0;
  const total = salario + ccss + ins + agui + vac;
  return { ccss, ins, aguinaldo: agui, vacaciones: vac, total, anual: total * 12, factor: salario ? total / salario : 0 };
}

/* ─────────────────  Horas extra  ───────────────── */

export const JORNADAS = [
  { id: "diurna", label: "Diurna (8 h)", horas: 8 },
  { id: "mixta", label: "Mixta (7 h)", horas: 7 },
  { id: "nocturna", label: "Nocturna (6 h)", horas: 6 },
] as const;

export function horasExtra(input: { salario: number; horasJornada: number; extras: number; feriadoOrdinarias: number; feriadoExtras: number }) {
  const vh = valorHora(input.salario, input.horasJornada);
  const extras = input.extras * vh * FACTOR_HE_SIMPLE;
  // Salario mensual: el feriado ya está pagado; trabajarlo agrega un sencillo para completar el doble.
  const feriado = input.feriadoOrdinarias * vh;
  const feriadoExtras = input.feriadoExtras * vh * FACTOR_HE_FERIADO;
  return { valorHora: vh, extras, feriado, feriadoExtras, total: extras + feriado + feriadoExtras };
}

/* ─────────────────  Vacaciones  ───────────────── */

export function vacaciones(input: { ingreso: string; corte: string; disfrutados: number; promedio: number }) {
  const meses = mesesEntre(input.ingreso, input.corte);
  const ganados = Math.floor(meses) * (datos.jornada.vacaciones_dias_anio / 12);
  const pendientes = Math.max(0, ganados - input.disfrutados);
  const diario = input.promedio / DIAS_MES;
  return { meses, ganados, pendientes, diario, monto: pendientes * diario };
}

/* ─────────────────  Feriados  ───────────────── */

export type Feriado = { fecha: string; nombre: string; obligatorio: boolean };
export const FERIADOS: Feriado[] = datos.feriados.dias.map(([fecha, nombre, obligatorio]) => ({ fecha: fecha as string, nombre: nombre as string, obligatorio: obligatorio as boolean }));
export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const diaSemana = (iso: string) => DIAS_SEMANA[new Date(iso + "T00:00:00").getDay()];

export function pagoFeriado(input: { tipo: "mensual" | "semanal"; salario: number; obligatorio: boolean; horas: number; horasJornada: number }) {
  const diario = input.tipo === "mensual" ? input.salario / DIAS_MES : input.salario;
  const fraccion = Math.min(1, input.horas / input.horasJornada);
  // Mensual: el feriado ya está en el salario, se agrega un sencillo. Semanal: obligatorio = doble; no obligatorio = sencillo.
  const factor = input.tipo === "mensual" ? 1 : input.obligatorio ? 2 : 1;
  return { diario, factor, adicional: diario * factor * fraccion };
}

/* ─────────────────  Salario mínimo  ───────────────── */

export type Categoria = { codigo: string; nombre: string; monto: number; unidad: "jornada" | "mes" };
export const CATEGORIAS: Categoria[] = datos.salario_minimo.categorias.map(([codigo, nombre, monto, unidad]) => ({
  codigo: codigo as string,
  nombre: nombre as string,
  monto: monto as number,
  unidad: unidad as "jornada" | "mes",
}));
export const OCUPACIONES = datos.salario_minimo.ocupaciones.map(([nombre, codigo]) => ({ nombre, codigo }));
export const mensualDeCategoria = (c: Categoria) => (c.unidad === "jornada" ? c.monto * DIAS_MES : c.monto);

/* ─────────────────  Construcción  ───────────────── */

export const TIPOLOGIAS = datos.construccion.tipologias.map(([codigo, nombre, area, valor]) => ({
  codigo: codigo as string,
  nombre: nombre as string,
  area: area as string,
  valor: valor as number,
}));

export function costoConstruccion(input: { tipologia: number; area: number; ajuste: number; imprevistos: number }) {
  const t = TIPOLOGIAS[input.tipologia];
  const base = t.valor * input.area;
  const ajuste = base * (input.ajuste / 100);
  const imprevistos = (base + ajuste) * (input.imprevistos / 100);
  const total = base + ajuste + imprevistos;
  return { t, base, ajuste, imprevistos, total, porM2: input.area ? total / input.area : 0 };
}

/* ─────────────────  Ahorro por automatización  ───────────────── */

export const HORAS_MES_REALES = (48 * 52) / 12; // 208 horas efectivas al mes

export function ahorroAutomatizacion(input: { personas: number; horasSemana: number; salario: number; porcentaje: number }) {
  const factor = 1 + CCSS_PATRONO + INS_CLASES[0].tasa + PROV_AGUINALDO + PROV_VACACIONES;
  const costoHora = (input.salario * factor) / HORAS_MES_REALES;
  const horasMes = input.personas * input.horasSemana * (52 / 12);
  const costoMes = horasMes * costoHora;
  const ahorroMes = costoMes * (input.porcentaje / 100);
  return { factor, costoHora, horasMes, costoMes, costoAnio: costoMes * 12, ahorroMes, ahorroAnio: ahorroMes * 12, horasLiberadasAnio: horasMes * 12 * (input.porcentaje / 100) };
}
