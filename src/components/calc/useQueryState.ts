"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

type Val = string | number | boolean;
type W<T> = { [K in keyof T]: T[K] extends boolean ? boolean : T[K] extends number ? number : string };

/**
 * Estado de la calculadora que se puede compartir por enlace:
 * lee ?salario=...&hijos=... al abrir la página y genera el enlace con los valores actuales.
 */
export function useQueryState<D extends Record<string, Val>>(initial: D, kind: string) {
  type T = W<D>;
  const defaults = initial as unknown as T;
  const [state, setState] = useState<T>(defaults);
  const [fromUrl, setFromUrl] = useState(false);
  const used = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    let any = false;
    const next = { ...defaults };
    for (const k of Object.keys(defaults) as (keyof T)[]) {
      const v = p.get(k as string);
      if (v === null) continue;
      any = true;
      const d = defaults[k];
      next[k] = (typeof d === "number" ? Number(v) || 0 : typeof d === "boolean" ? v === "1" : v) as T[keyof T];
    }
    if (any) {
      setState(next);
      setFromUrl(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback(
    <K extends keyof T>(k: K) =>
      (v: T[K]) => {
        if (!used.current) {
          used.current = true;
          track("calculator_use", { calculator: kind });
        }
        setState((s) => ({ ...s, [k]: v }));
      },
    [kind],
  );

  const query = new URLSearchParams(
    Object.entries(state).map(([k, v]) => [k, typeof v === "boolean" ? (v ? "1" : "0") : String(v)]),
  ).toString();

  return { state, set, query, fromUrl };
}
