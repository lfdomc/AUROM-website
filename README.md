# Sitio web A.U.R.O.M.

Sitio de **A.U.R.O.M.** (www.auromtec.com) hecho con Next.js. **Todo el contenido y el diseño están en un solo archivo: `content/site.json`.** Cambiar ese archivo cambia el sitio, sin tocar código.

## Qué hay en el sitio

| Página | Dirección |
|---|---|
| Inicio | `/` |
| Todas las soluciones | `/soluciones` |
| Planillas en Odoo | `/soluciones/planillas-odoo` |
| Bot para Airbnb | `/soluciones/bot-airbnb` |
| Asistente de consultas | `/soluciones/asistente-de-consultas` |
| Monitoreo de SICOP | `/soluciones/monitoreo-sicop` |
| Presupuestos de construcción | `/soluciones/presupuestos-de-construccion` |
| Análisis de datos | `/soluciones/analisis-de-datos` |
| Equipos y mantenimiento | `/soluciones/gestion-de-equipos-y-mantenimiento` |
| Clasificación de correos | `/soluciones/clasificacion-de-correos` |
| Software a la medida | `/software-a-la-medida` |
| Centroamérica y Latinoamérica | `/automatizacion-empresarial-centroamerica` |

Cada página tiene su propio título, descripción, imagen para redes sociales (`/og/...png`), datos estructurados para Google (empresa, servicio, preguntas frecuentes, migas de pan), y aparece en `sitemap.xml`.

Todos los botones "Hablemos de su proyecto" abren WhatsApp (+506 7012 0250) con un mensaje listo.

## Probarlo en su computadora

Necesita [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev        # abre http://localhost:3000
```

## Publicarlo (recomendado: Vercel, gratis para empezar)

1. Suba esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) elija **Add New → Project** e importe el repositorio. No hay que configurar nada.
3. En **Settings → Domains** agregue `auromtec.com` y `www.auromtec.com`, y copie en su proveedor de dominio los registros DNS que Vercel le indique.
4. Cuando el dominio esté activo, registre el sitio en [Google Search Console](https://search.google.com/search-console) y envíe `https://www.auromtec.com/sitemap.xml`.

¿Hosting sin Node (cPanel, Netlify, etc.)? Ejecute `npm run export` y suba el contenido de la carpeta `out/`.

## Cómo editar el sitio (`content/site.json`)

- **Textos**: cambie cualquier `headline`, `subhead`, `body`, preguntas (`q`/`a`), etc.
- **WhatsApp y mensaje**: `contact.whatsapp` y `contact.whatsappMessage`.
- **Correo**: agregue `"email": "info@auromtec.com"` dentro de `contact` (se suma solo a los datos de Google).
- **Colores**: `design.theme.colors`. El color dorado es `accent`.
- **Cuánto se mueve el sitio**: `design.dials.motion` (1 = quieto, 10 = muy animado).
- **Agregar una página**: copie un objeto dentro de `pages`, cambie `slug`, `seo` y textos. El sitemap y los datos para Google se actualizan solos; si quiere que aparezca en el pie de página, agréguela en `footer.columns`.
- **Orden de secciones**: mueva los bloques dentro de `sections`.

Después de editar, ejecute `npm run validar`. Si algo está mal, le dice exactamente qué línea corregir (por ejemplo: `pages.0.sections.2.headline: demasiado largo`). Si usa VS Code, el archivo tiene autocompletado gracias a `content/site.schema.json`.

## Tipos de sección disponibles

`hero`, `marquee`, `clients` (full o compact), `solutionIndex`, `portfolio`, `pipeline` (variantes: track, timeline, stairs, circuit, deck, checklist, path, tabs), `stickyStack`, `bento`, `horizontal`, `stats`, `beforeAfter`, `features`, `faq`, `related`, `cta`, `richText`.

## Vista previa al compartir por WhatsApp

Cada página genera su propia imagen de 1200×630 (`/og/....png`) con el logo, el titular y su proceso, además del título y la descripción. WhatsApp, Facebook, LinkedIn y X la muestran solos al pegar el enlace.

- Solo funciona con el sitio publicado en su dominio (WhatsApp no puede leer `localhost`).
- WhatsApp guarda la vista previa por un tiempo. Si cambia la imagen o el texto, pase el enlace por el [Depurador de Facebook](https://developers.facebook.com/tools/debug/) y presione **Volver a extraer**; WhatsApp usa los mismos datos.

## SEO incluido

- Título, descripción, enlace canónico e imagen para redes en cada página.
- Datos estructurados para Google: empresa, servicios, preguntas frecuentes y migas de pan, con cobertura en Costa Rica, Centroamérica y Latinoamérica.
- `sitemap.xml`, `robots.txt` y `llms.txt` (resumen para buscadores con inteligencia artificial).
- Página regional para búsquedas desde Panamá, Nicaragua, Honduras, El Salvador, Guatemala y el resto de la región.

## Pendiente antes de publicar

- Correo de contacto de la empresa (opcional, mejora el SEO local).
- Logo definitivo, si tienen uno (el actual es un monograma provisional en `src/components/ui/Logo.tsx` y `public/icon.svg`).
- Confirmar con MuntoPet y Comtel Ingeniería que están de acuerdo en aparecer en el sitio. Si tienen sus logos, se pueden agregar.
- Una frase de testimonio de algún cliente (con nombre y cargo) mejoraría mucho la confianza.
- Revisar los ejemplos de las ilustraciones (montos de planilla, mensajes) y ajustarlos si lo desean.

## Base de datos (opcional)

Si más adelante quiere editar el sitio desde un panel sin volver a publicar, `db/schema.sql` trae la tabla para guardar este mismo JSON en Postgres. Solo hay que cambiar `loadRaw()` en `src/lib/content.ts`.
