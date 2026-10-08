/**
 * Un "reporte" describe el resultado de una calculadora una sola vez.
 * Con él se dibuja la tarjeta en pantalla, el mensaje de WhatsApp y el PDF, así los tres siempre coinciden.
 */
import { crc, fechaLarga, hoyIso, VIGENCIA } from "@/lib/planilla";

export type Row = {
  label: string;
  /** Monto en colones. Si no hay monto, se muestra `text`. */
  value?: number;
  text?: string;
  sign?: "+" | "-";
  note?: string;
};

export type Report = {
  /** Título del documento: "Calculadora de salario neto Costa Rica 2026" */
  title: string;
  /** Rótulo corto de la tarjeta: "Salario neto" */
  label: string;
  totalLabel: string;
  total: number;
  /** Si el total no es dinero (por ejemplo días), se muestra este texto. */
  totalText?: string;
  inputs: [string, string][];
  rows: Row[];
  extras?: string[];
  /** Reglas usadas para el cálculo (tramos, porcentajes, artículos de ley). */
  basis: string[];
};

export const rowValue = (r: Row) => (r.value !== undefined ? `${r.value && r.sign === "-" ? "− " : r.value && r.sign === "+" ? "+ " : ""}${crc(r.value)}` : (r.text ?? ""));
export const totalValue = (r: Report) => r.totalText ?? crc(r.total);

/* ─────────────────  WhatsApp  ───────────────── */

export function whatsappText(r: Report, url: string, brand: string) {
  const lines = [
    `*${r.title}*`,
    "",
    "*Datos*",
    ...r.inputs.map(([k, v]) => `• ${k}: ${v}`),
    "",
    "*Cálculo*",
    ...r.rows.map((row) => `• ${row.label}: ${rowValue(row)}`),
    "",
    `*${r.totalLabel}: ${totalValue(r)}*`,
    ...(r.extras?.length ? ["", ...r.extras] : []),
    "",
    `Base: ${r.basis[0] ?? `reglas ${VIGENCIA}`}`,
    "",
    `Ver el cálculo completo o cambiar los datos:`,
    url,
    "",
    `_Calculado con ${brand}. Referencia, no sustituye asesoría legal o contable._`,
  ];
  return lines.join("\n");
}

export const whatsappShareUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/* ─────────────────  PDF  ───────────────── */

async function fontB64(path: string) {
  const buf = await (await fetch(path)).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

type Brand = { name: string; tagline: string; site: string; whatsapp: string };

const C = {
  ink: [18, 21, 28] as const,
  muted: [96, 103, 116] as const,
  line: [226, 222, 212] as const,
  gold: [191, 137, 26] as const,
  goldSoft: [251, 243, 223] as const,
  red: [178, 58, 40] as const,
  head: [18, 21, 28] as const,
  headGold: [239, 188, 79] as const,
};

export async function buildPdf(r: Report, url: string, brand: Brand) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const [reg, bold] = await Promise.all([fontB64("/fonts/pdf-regular.ttf"), fontB64("/fonts/pdf-bold.ttf")]);
  doc.addFileToVFS("aurom-r.ttf", reg);
  doc.addFont("aurom-r.ttf", "Aurom", "normal");
  doc.addFileToVFS("aurom-b.ttf", bold);
  doc.addFont("aurom-b.ttf", "Aurom", "bold");

  const W = 210;
  const H = 297;
  const M = 18;
  const CW = W - M * 2;
  let y = 0;

  const color = (c: readonly [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (style: "normal" | "bold", size: number) => {
    doc.setFont("Aurom", style);
    doc.setFontSize(size);
  };
  const line = (yy: number) => {
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.25);
    doc.line(M, yy, W - M, yy);
  };
  const footer = () => {
    font("normal", 8);
    color(C.muted);
    doc.text(`${brand.name} · ${brand.site} · WhatsApp ${brand.whatsapp}`, M, H - 10);
    doc.text(`Página ${doc.getNumberOfPages()}`, W - M, H - 10, { align: "right" });
  };
  const ensure = (h: number) => {
    if (y + h > H - 22) {
      footer();
      doc.addPage();
      y = 20;
    }
  };
  const heading = (t: string) => {
    ensure(14);
    y += 4;
    font("bold", 10);
    color(C.gold);
    doc.text(t.toUpperCase(), M, y, { charSpace: 0.4 });
    y += 2.5;
    line(y);
    y += 5;
  };
  const pair = (label: string, value: string, opts: { note?: string; valueColor?: readonly [number, number, number]; strong?: boolean } = {}) => {
    font("normal", 10);
    const labelLines = doc.splitTextToSize(label, CW - 60) as string[];
    const noteLines = opts.note ? (doc.splitTextToSize(opts.note, CW - 60) as string[]) : [];
    const h = labelLines.length * 4.4 + noteLines.length * 3.6 + 2.6;
    ensure(h + 2);
    font(opts.strong ? "bold" : "normal", 10);
    color(C.ink);
    doc.text(labelLines, M, y);
    font(opts.strong ? "bold" : "normal", 10);
    color(opts.valueColor ?? C.ink);
    doc.text(value, W - M, y, { align: "right" });
    let yy = y + labelLines.length * 4.4;
    if (noteLines.length) {
      font("normal", 8.5);
      color(C.muted);
      doc.text(noteLines, M, yy - 0.9);
      yy += noteLines.length * 3.6;
    }
    y = yy + 0.6;
    line(y - 2.2);
    y += 2.2;
  };

  // Encabezado
  doc.setFillColor(...C.head);
  doc.rect(0, 0, W, 30, "F");
  font("bold", 15);
  color(C.headGold);
  doc.text(brand.name, M, 14);
  font("normal", 8.5);
  doc.setTextColor(200, 204, 214);
  doc.text(brand.tagline, M, 20);
  doc.text(brand.site, W - M, 14, { align: "right" });
  doc.text(`WhatsApp ${brand.whatsapp}`, W - M, 20, { align: "right" });
  y = 42;

  // Título
  font("bold", 19);
  color(C.ink);
  const t = doc.splitTextToSize(r.title, CW) as string[];
  doc.text(t, M, y);
  y += t.length * 8;
  font("normal", 9);
  color(C.muted);
  doc.text(`Generado el ${fechaLarga(hoyIso())} · Datos vigentes ${VIGENCIA}`, M, y);
  y += 8;

  // Total destacado
  doc.setFillColor(...C.goldSoft);
  doc.roundedRect(M, y, CW, 22, 3, 3, "F");
  font("normal", 9.5);
  color(C.muted);
  doc.text(r.totalLabel, M + 7, y + 8);
  font("bold", 20);
  color(C.ink);
  doc.text(totalValue(r), M + 7, y + 17);
  y += 28;
  if (r.extras?.length) {
    font("normal", 10);
    color(C.ink);
    for (const e of r.extras) {
      const l = doc.splitTextToSize(e, CW) as string[];
      ensure(l.length * 5);
      doc.text(l, M, y);
      y += l.length * 5;
    }
    y += 1;
  }

  heading("Datos ingresados");
  for (const [k, v] of r.inputs) pair(k, v);

  heading("Detalle del cálculo");
  for (const row of r.rows) pair(row.label, rowValue(row), { note: row.note, valueColor: row.sign === "-" && row.value ? C.red : C.ink });
  pair(r.totalLabel, totalValue(r), { strong: true });

  heading("Base de cálculo");
  font("normal", 9.5);
  color(C.ink);
  for (const b of r.basis) {
    const l = doc.splitTextToSize(b, CW - 5) as string[];
    ensure(l.length * 4.4 + 1.5);
    doc.text("•", M, y);
    doc.text(l, M + 4, y);
    y += l.length * 4.4 + 1.5;
  }

  // Enlace al cálculo en línea
  ensure(22);
  y += 4;
  font("bold", 10);
  color(C.ink);
  doc.text("Ver o modificar este cálculo en línea", M, y);
  y += 5;
  font("normal", 9);
  color(C.gold);
  doc.textWithLink(`${url.replace(/^https?:\/\//, "").split("?")[0]} (abre con sus datos)`, M, y, { url });
  y += 7;
  font("normal", 8.5);
  color(C.muted);
  const disc = doc.splitTextToSize(
    "Cálculo de referencia con la normativa vigente en Costa Rica. No sustituye una asesoría legal, contable o tributaria. Verifique los montos con la planilla oficial de su empresa.",
    CW,
  ) as string[];
  ensure(disc.length * 4);
  doc.text(disc, M, y);

  footer();
  return doc;
}

export async function sharePdf(r: Report, url: string, brand: Brand, fileName: string) {
  const doc = await buildPdf(r, url, brand);
  const blob = doc.output("blob");
  const file = new File([blob], fileName, { type: "application/pdf" });
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: r.title, text: `${r.title}: ${totalValue(r)}` });
      return "shared" as const;
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled" as const;
    }
  }
  doc.save(fileName);
  return "downloaded" as const;
}
