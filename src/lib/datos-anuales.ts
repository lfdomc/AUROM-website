/**
 * Datos que cambian cada año (revisar en diciembre):
 * - Salarios mínimos: Decreto Ejecutivo 45303-MTSS (Alcance 156, La Gaceta 229, 5 dic 2025), rige 1 ene 2026.
 * - Feriados: Código de Trabajo art. 148; MTSS CARTA-MTSS-DAJ-AER-1076-2025 (sin traslados en 2026).
 *   2027 calculado con el art. 148 vigente (proyecto de ley 25.593 de traslados aún no aprobado).
 * - Costo de construcción: Manual de Valores Base Unitarios por Tipología Constructiva 2023 (ONT, Hacienda).
 */

export const SALARIO_MINIMO_VIGENCIA = "2026";
export const SALARIO_MINIMO_DECRETO = "Decreto Ejecutivo 45303-MTSS";

export type CategoriaSM = { code: string; nombre: string; monto: number; unidad: "jornada" | "mes" };

export const CATEGORIAS_SM: CategoriaSM[] = [
  { code: "TONC", nombre: "Trabajador en Ocupación No Calificada", monto: 12436.41, unidad: "jornada" },
  { code: "TOSC", nombre: "Trabajador en Ocupación Semicalificada", monto: 13523.69, unidad: "jornada" },
  { code: "TOC", nombre: "Trabajador en Ocupación Calificada", monto: 13991.86, unidad: "jornada" },
  { code: "TOE", nombre: "Trabajador en Ocupación Especializada", monto: 16244.5, unidad: "jornada" },
  { code: "TES", nombre: "Trabajador de Especialización Superior", monto: 25209.8, unidad: "jornada" },
  { code: "TONCG", nombre: "No Calificada (genérico)", monto: 373092.3, unidad: "mes" },
  { code: "TOSCG", nombre: "Semicalificada (genérico)", monto: 405710.7, unidad: "mes" },
  { code: "TOCG", nombre: "Calificada (genérico)", monto: 419755.8, unidad: "mes" },
  { code: "TOEG", nombre: "Especializada (genérico)", monto: 487335.0, unidad: "mes" },
  { code: "TMED", nombre: "Técnico Medio en Educación Diversificada", monto: 496838.17, unidad: "mes" },
  { code: "DES", nombre: "Diplomado de Educación Superior", monto: 585484.58, unidad: "mes" },
  { code: "Bach", nombre: "Bachiller universitario", monto: 664078.07, unidad: "mes" },
  { code: "Lic", nombre: "Licenciado universitario", monto: 796921.0, unidad: "mes" },
  { code: "TD", nombre: "Trabajo doméstico", monto: 268731.31, unidad: "mes" },
];

export const categoriaSM = (code: string) => CATEGORIAS_SM.find((c) => c.code === code)!;
/** Mensual equivalente (MTSS: los genéricos mensuales son 30 × la jornada). */
export const mensualSM = (c: CategoriaSM) => (c.unidad === "jornada" ? c.monto * 30 : c.monto);

/** Ocupaciones frecuentes (Lista de salarios mínimos 2026 del MTSS; los sinónimos están marcados). */
export const OCUPACIONES: { nombre: string; code: string; sinonimo?: boolean }[] = [
  { nombre: "Peón de construcción", code: "TONC" },
  { nombre: "Ayudante de operario de construcción", code: "TOSC" },
  { nombre: "Albañil", code: "TOC" },
  { nombre: "Operario de construcción", code: "TOC" },
  { nombre: "Maestro de obras", code: "TOE" },
  { nombre: "Carpintero", code: "TOC" },
  { nombre: "Ebanista", code: "TOE" },
  { nombre: "Electricista", code: "TOC" },
  { nombre: "Electromecánico", code: "TOE" },
  { nombre: "Fontanero", code: "TOC" },
  { nombre: "Soldador", code: "TOC" },
  { nombre: "Soldador de soldaduras especiales", code: "TOE" },
  { nombre: "Pintor de brocha gorda", code: "TOC" },
  { nombre: "Mecánico general", code: "TOC" },
  { nombre: "Tornero en metal", code: "TOE" },
  { nombre: "Pintor automotriz", code: "TOE" },
  { nombre: "Operador de maquinaria pesada", code: "TOC" },
  { nombre: "Tractorista", code: "TOC" },
  { nombre: "Montacarguista", code: "TOSC" },
  { nombre: "Mantenimiento de edificios", code: "TOC" },
  { nombre: "Misceláneo", code: "TONCG" },
  { nombre: "Conserje", code: "TONCG" },
  { nombre: "Mensajero", code: "TONCG" },
  { nombre: "Bodeguero (peón)", code: "TONCG" },
  { nombre: "Bodeguero (encargado)", code: "TOSCG" },
  { nombre: "Agente de seguridad", code: "TOSCG" },
  { nombre: "Guarda o vigilante", code: "TOSCG", sinonimo: true },
  { nombre: "Agente de seguridad custodio de valores", code: "TOCG" },
  { nombre: "Cajero", code: "TOCG" },
  { nombre: "Dependiente de comercio", code: "TOSC" },
  { nombre: "Agente de ventas", code: "TOCG" },
  { nombre: "Cobrador", code: "TOSCG" },
  { nombre: "Conductor de vehículo liviano", code: "TOSC" },
  { nombre: "Conductor de vehículo pesado", code: "TOC" },
  { nombre: "Conductor de tráiler", code: "TOE" },
  { nombre: "Conductor de bus", code: "TOC" },
  { nombre: "Taxista", code: "TOC" },
  { nombre: "Pistero (dispensador de combustible)", code: "TOSC" },
  { nombre: "Secretaria (sin título)", code: "TOCG" },
  { nombre: "Recepcionista", code: "TOSCG" },
  { nombre: "Telefonista", code: "TOSCG" },
  { nombre: "Oficinista", code: "TOSCG" },
  { nombre: "Digitador", code: "TOC" },
  { nombre: "Auxiliar de contabilidad", code: "TOCG" },
  { nombre: "Contador privado (bachiller)", code: "Bach" },
  { nombre: "Contador privado (licenciado)", code: "Lic" },
  { nombre: "Salonero", code: "TONC" },
  { nombre: "Mesero", code: "TONC", sinonimo: true },
  { nombre: "Camarero", code: "TONC" },
  { nombre: "Mucama", code: "TONC" },
  { nombre: "Pilero (lavaplatos)", code: "TONC" },
  { nombre: "Ayudante de cocina", code: "TOSC" },
  { nombre: "Cocinero", code: "TOC" },
  { nombre: "Chef", code: "TOE" },
  { nombre: "Panadero", code: "TOC" },
  { nombre: "Cantinero", code: "TOSC" },
  { nombre: "Bartender (coctelero)", code: "TOC" },
  { nombre: "Peón agrícola", code: "TONC" },
  { nombre: "Peón de jardín", code: "TONC" },
  { nombre: "Jardinero (diseño de jardines)", code: "TOC" },
  { nombre: "Peón de carga y descarga", code: "TONC" },
  { nombre: "Empacador o etiquetador", code: "TONC" },
  { nombre: "Recolector de basura", code: "TONC" },
  { nombre: "Estilista o barbero", code: "TOC" },
  { nombre: "Costurera (modista)", code: "TOE" },
  { nombre: "Programador (sin título)", code: "TOE" },
  { nombre: "Guía de turismo", code: "TOC" },
  { nombre: "Niñera (fuera del hogar del niño)", code: "TONC" },
  { nombre: "Trabajadora doméstica", code: "TD" },
];

/* ─────────────────  Feriados  ───────────────── */

export type Feriado = { fecha: string; nombre: string; obligatorio: boolean };

export const FERIADOS: Record<number, Feriado[]> = {
  2026: [
    { fecha: "2026-01-01", nombre: "Año Nuevo", obligatorio: true },
    { fecha: "2026-04-02", nombre: "Jueves Santo", obligatorio: true },
    { fecha: "2026-04-03", nombre: "Viernes Santo", obligatorio: true },
    { fecha: "2026-04-11", nombre: "Día de Juan Santamaría", obligatorio: true },
    { fecha: "2026-05-01", nombre: "Día Internacional del Trabajo", obligatorio: true },
    { fecha: "2026-07-25", nombre: "Anexión del Partido de Nicoya", obligatorio: true },
    { fecha: "2026-08-02", nombre: "Día de la Virgen de los Ángeles", obligatorio: false },
    { fecha: "2026-08-15", nombre: "Día de la Madre", obligatorio: true },
    { fecha: "2026-08-31", nombre: "Día de la Persona Negra y la Cultura Afrocostarricense", obligatorio: false },
    { fecha: "2026-09-15", nombre: "Día de la Independencia", obligatorio: true },
    { fecha: "2026-12-01", nombre: "Día de la Abolición del Ejército", obligatorio: false },
    { fecha: "2026-12-25", nombre: "Navidad", obligatorio: true },
  ],
  2027: [
    { fecha: "2027-01-01", nombre: "Año Nuevo", obligatorio: true },
    { fecha: "2027-03-25", nombre: "Jueves Santo", obligatorio: true },
    { fecha: "2027-03-26", nombre: "Viernes Santo", obligatorio: true },
    { fecha: "2027-04-11", nombre: "Día de Juan Santamaría", obligatorio: true },
    { fecha: "2027-05-01", nombre: "Día Internacional del Trabajo", obligatorio: true },
    { fecha: "2027-07-25", nombre: "Anexión del Partido de Nicoya", obligatorio: true },
    { fecha: "2027-08-02", nombre: "Día de la Virgen de los Ángeles", obligatorio: false },
    { fecha: "2027-08-15", nombre: "Día de la Madre", obligatorio: true },
    { fecha: "2027-08-31", nombre: "Día de la Persona Negra y la Cultura Afrocostarricense", obligatorio: false },
    { fecha: "2027-09-15", nombre: "Día de la Independencia", obligatorio: true },
    { fecha: "2027-12-01", nombre: "Día de la Abolición del Ejército", obligatorio: false },
    { fecha: "2027-12-25", nombre: "Navidad", obligatorio: true },
  ],
};

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DIAS[dt.getUTCDay()]} ${d} de ${MESES[m - 1]}`;
};

/* ─────────────────  Costo de construcción  ───────────────── */

export const TIPOLOGIA_FUENTE = "Manual de Valores Base Unitarios por Tipología Constructiva 2023 (ONT, Ministerio de Hacienda), valores a marzo de 2023";

export const TIPOLOGIAS: { code: string; nombre: string; area: string; m2: number }[] = [
  { code: "VC01", nombre: "Interés social, acabados económicos", area: "42–90 m²", m2: 260000 },
  { code: "VC02", nombre: "Económica", area: "80–110 m²", m2: 320000 },
  { code: "VC03", nombre: "Clase media", area: "100–150 m²", m2: 365000 },
  { code: "VC04", nombre: "Media, acabados buenos", area: "140–220 m²", m2: 425000 },
  { code: "VC05", nombre: "Calidad buena", area: "210–250 m²", m2: 485000 },
  { code: "VC06", nombre: "Calidad muy buena", area: "240–300 m²", m2: 545000 },
  { code: "VC07", nombre: "Alta", area: "290–350 m²", m2: 700000 },
  { code: "VC08", nombre: "Lujo", area: "340–400 m²", m2: 920000 },
  { code: "VC09", nombre: "Lujo con materiales importados", area: "390 m² o más", m2: 1495000 },
  { code: "VC10", nombre: "Lujo, acabados importados y artesanales", area: "390 m² o más", m2: 1835000 },
  { code: "VS01", nombre: "Muro seco (estructura liviana), básica", area: "100–150 m²", m2: 310000 },
  { code: "VS02", nombre: "Muro seco, mejores acabados", area: "140–350 m²", m2: 500000 },
  { code: "VM01", nombre: "Madera, acabados económicos", area: "36–90 m²", m2: 290000 },
  { code: "VM02", nombre: "Madera, 1 o 2 plantas", area: "80–150 m²", m2: 425000 },
  { code: "VE01", nombre: "Modular de acero", area: "24–90 m²", m2: 550000 },
  { code: "VR01", nombre: "Contenedor reciclado", area: "", m2: 285000 },
];
