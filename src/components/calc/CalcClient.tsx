"use client";

import type { ComponentType } from "react";
import { CalcProvider, type CalcCtx } from "./ui";
import { CalcAguinaldo, CalcCostoPatronal, CalcHorasExtra, CalcLiquidacion, CalcSalarioNeto, CalcVacaciones } from "./tools-planilla";
import { CalcAhorro, CalcConstruccion, CalcFeriado, CalcSalarioMinimo } from "./tools-otros";

export const TOOLS = {
  "salario-neto": CalcSalarioNeto,
  aguinaldo: CalcAguinaldo,
  liquidacion: CalcLiquidacion,
  "costo-patronal": CalcCostoPatronal,
  "horas-extra": CalcHorasExtra,
  vacaciones: CalcVacaciones,
  "salario-minimo": CalcSalarioMinimo,
  feriados: CalcFeriado,
  construccion: CalcConstruccion,
  "ahorro-automatizacion": CalcAhorro,
} satisfies Record<string, ComponentType>;

export type ToolKind = keyof typeof TOOLS;

export function CalcClient({ ctx }: { ctx: CalcCtx }) {
  const Tool = TOOLS[ctx.kind as ToolKind];
  return (
    <CalcProvider value={ctx}>
      <Tool />
    </CalcProvider>
  );
}
