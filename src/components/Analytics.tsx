"use client";

import Script from "next/script";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Google Analytics 4. Solo se carga si existe seo.ga4Id en content/site.json. Mide también los clics a WhatsApp. */
export function Analytics({ id }: { id: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='wa.me/']") as HTMLAnchorElement | null;
      if (!a || a.href.includes("wa.me/?text")) return; // los "compartir" ya se miden aparte
      track("whatsapp_click", { page: location.pathname, label: a.textContent?.trim().slice(0, 60) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
