import type { NextConfig } from "next";

/**
 * El sitio es 100 % estático: `next build` genera HTML en /out, listo para la red de Cloudflare
 * (o cualquier hosting). Encabezados de seguridad y caché: public/_headers.
 */
const config: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
};

export default config;
