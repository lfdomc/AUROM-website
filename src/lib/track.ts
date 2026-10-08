/** Envía un evento a Google Analytics 4 si está activo (seo.ga4Id en site.json). Si no, no hace nada. */
type Gtag = (cmd: "event", name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  g?.("event", name, params);
}
