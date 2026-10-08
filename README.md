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
| Herramientas gratis | `/calculadoras` |
| Salario mínimo 2026 | `/calculadoras/salario-minimo-costa-rica` |
| Feriados 2026 y 2027 | `/calculadoras/feriados-costa-rica` |
| Horas extra | `/calculadoras/horas-extra-costa-rica` |
| Vacaciones | `/calculadoras/vacaciones-costa-rica` |
| Costo de construcción por m² | `/calculadoras/costo-construccion-m2-costa-rica` |
| Ahorro por automatización | `/calculadoras/ahorro-por-automatizacion` |
| Salario neto 2026 | `/calculadoras/salario-neto-costa-rica` |
| Aguinaldo | `/calculadoras/aguinaldo-costa-rica` |
| Liquidación laboral | `/calculadoras/liquidacion-laboral-costa-rica` |
| Costo patronal | `/calculadoras/costo-patronal-costa-rica` |

Cada página tiene su propio título, descripción, imagen para redes sociales (`/og/...png`), datos estructurados para Google (empresa, servicio, preguntas frecuentes, migas de pan), y aparece en `sitemap.xml`.

Todos los botones "Hablemos de su proyecto" abren WhatsApp (+506 7012 0250) con un mensaje listo.

## Probarlo en su computadora

Necesita [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev        # versión de trabajo en http://localhost:3000
npm run build      # genera el sitio final en la carpeta /out
npm run preview    # muestra /out tal como quedará publicado
```

## Publicarlo en Cloudflare

El sitio es 100 % estático: Cloudflare sirve la carpeta `/out` desde su red, sin servidor (más rápido y mejor para Google). La configuración está en `wrangler.jsonc` y los encabezados de seguridad y caché en `public/_headers`.

En Cloudflare, **Workers & Pages → su proyecto → Settings → Build**:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- El nombre del Worker debe ser `aurom-website` (igual que en `wrangler.jsonc`). Si usa otro nombre, cámbielo en ese archivo.

Dominios: en **Settings → Domains & Routes** agregue `www.auromtec.com` y `auromtec.com`. Luego, en **Rules → Redirect Rules**, cree una regla que redirija `auromtec.com/*` a `https://www.auromtec.com/$1` (301), para que Google vea una sola versión del sitio.

Desde su computadora también puede publicar con `npm run deploy` (pide iniciar sesión en Cloudflare la primera vez).

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

`hero`, `marquee`, `clients` (full o compact), `solutionIndex`, `portfolio`, `calculator` (salario-neto, aguinaldo, liquidacion, costo-patronal, horas-extra, vacaciones, salario-minimo, feriados, construccion, ahorro-automatizacion), `pipeline` (variantes: track, timeline, stairs, circuit, deck, checklist, path, tabs), `stickyStack`, `bento`, `horizontal`, `stats`, `beforeAfter`, `features`, `faq`, `related`, `cta`, `richText`.

## Calculadoras y datos oficiales

**Todos los números oficiales están en `content/datos-cr.json`:** tramos de renta, CCSS, INS, cesantía, salarios mínimos por categoría y ocupación, feriados, y valores por m² de Hacienda. Cuando salga un decreto nuevo:

1. Cambie los números en ese archivo, junto con `vigencia` (año) y `actualizado` (fecha).
2. Ejecute `npm run build` y publique.

Las calculadoras, tablas, PDF, mensajes de WhatsApp y la fecha "actualizado en" se actualizan solos. Las fórmulas están en `src/lib/planilla.ts`. Los textos y las preguntas de cada página están en `content/site.json` (sección `calculator`).

**Calendario de revisión:**
- Salario mínimo: decreto en diciembre, rige el 1 de enero.
- Tramos de renta: decreto de Hacienda en noviembre o diciembre.
- CCSS: cambios en enero.
- Feriados del año siguiente: calendario del MTSS en noviembre o diciembre.
- Hacienda (m²): manual cada 2 años.

**Compartir resultados.** Cada calculadora tiene tres opciones:
- **WhatsApp:** abre WhatsApp con el desglose y un enlace que reabre la calculadora con los mismos datos.
- **PDF:** reporte de una página con logo, datos, desglose y base legal. En el celular abre el menú de compartir.
- **Copiar enlace.**

**Google Analytics 4.** Pegue su ID en `seo.ga4Id` dentro de `content/site.json` (por ejemplo `"ga4Id": "G-ABC123XYZ"`). El sitio mide estos eventos: `calculator_use`, `calculator_share` (whatsapp, pdf o link), `calculator_lead` y `whatsapp_click`. En GA4 márquelos como eventos clave (**Administrar → Eventos**).

## Vista previa al compartir por WhatsApp

Cada página genera su propia imagen de 1200×630 (`/og/....png`) con el logo, el titular y su proceso, además del título y la descripción. WhatsApp, Facebook, LinkedIn y X la muestran solos al pegar el enlace.

- Solo funciona con el sitio publicado en internet (WhatsApp no puede leer `localhost`).
- La imagen se toma de la dirección de `site.url` (www.auromtec.com). Mientras el dominio no esté conectado, en Cloudflare agregue la variable de build `OG_IMAGE_BASE_URL` = `https://aurom-website.lfdomc.workers.dev` para que la imagen se sirva desde la dirección temporal. Cuando conecte el dominio, puede borrarla.
- WhatsApp guarda la vista previa por un tiempo. Si cambia la imagen o el texto, pase el enlace por el [Depurador de Facebook](https://developers.facebook.com/tools/debug/) y presione **Volver a extraer**; WhatsApp usa los mismos datos.

## SEO: qué hacer después de publicar (en este orden)

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)): agregue la propiedad de dominio `auromtec.com`, verifíquela con el registro DNS que le indican (en Cloudflare es un clic) y envíe `https://www.auromtec.com/sitemap.xml`. Si prefiere verificar con etiqueta HTML, pegue el código en `seo.verification.google` dentro de `content/site.json`.
2. **Solicite la indexación** de cada página importante: en Search Console, pegue la dirección en la barra de arriba y presione *Solicitar indexación*. Empiece por el inicio, `/soluciones` y cada servicio.
3. **Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)): puede importar todo desde Search Console. Bing también alimenta a ChatGPT y Copilot. El código opcional va en `seo.verification.bing`.
4. **IndexNow:** después de cada publicación ejecute `npm run indexnow`. Avisa a Bing y a otros buscadores que el sitio cambió para que lo revisen en minutos.
5. **Perfil de Empresa en Google** ([business.google.com](https://business.google.com)): créelo como empresa de servicios en Costa Rica, con el sitio web, WhatsApp, horario y categorías como "Servicio de desarrollo de software" y "Consultor informático". Es lo que más ayuda a aparecer en búsquedas locales y en Google Maps. Si agrega ciudad y provincia en `contact.city` y `contact.region`, el sitio las incluye en los datos para Google.
6. **Enlaces de sus clientes:** pida a Grupo AMSO, HG Remodelaciones, EsGo Legal y Blue One un enlace en el pie de su sitio ("Sitio web por A.U.R.O.M." hacia https://www.auromtec.com/soluciones/sitios-web). Los enlaces desde sitios reales son una de las señales más fuertes para Google.
7. **Reseñas:** pida a sus clientes una reseña en el Perfil de Empresa de Google.
8. **Nuevas guías:** cada guía en `/recursos` atrae búsquedas nuevas. Una guía al mes con preguntas reales de sus clientes hace crecer el tráfico de forma constante.

## SEO incluido

- Título, descripción, enlace canónico e imagen para redes en cada página.
- Datos estructurados para Google: empresa, servicios, preguntas frecuentes y migas de pan, con cobertura en Costa Rica, Centroamérica y Latinoamérica.
- `sitemap.xml`, `robots.txt` y `llms.txt` (resumen para buscadores con inteligencia artificial).
- Página regional para búsquedas desde Panamá, Nicaragua, Honduras, El Salvador, Guatemala y el resto de la región.
- En cada página, el H1 es la frase que la gente busca (por ejemplo "Sistema de planillas en Odoo para Costa Rica"); el titular creativo va grande debajo.
- Migas de pan visibles y en los datos para Google (Inicio › Soluciones › Servicio).
- Guías en `/recursos` con datos de artículo (BlogPosting) para búsquedas informativas.
- Señales de idioma y región (es-CR), logo PNG para Google, encabezados de seguridad y caché, y sitio estático servido desde la red de Cloudflare.

## Pendiente antes de publicar

- Correo de contacto de la empresa (opcional, mejora el SEO local).
- Logo definitivo, si tienen uno (el actual es un monograma provisional en `src/components/ui/Logo.tsx` y `public/icon.svg`).
- Confirmar con MuntoPet y Comtel Ingeniería que están de acuerdo en aparecer en el sitio. Si tienen sus logos, se pueden agregar.
- Una frase de testimonio de algún cliente (con nombre y cargo) mejoraría mucho la confianza.
- Revisar los ejemplos de las ilustraciones (montos de planilla, mensajes) y ajustarlos si lo desean.

## Base de datos (opcional)

Si más adelante quiere editar el sitio desde un panel sin volver a publicar, `db/schema.sql` trae la tabla para guardar este mismo JSON en Postgres. Solo hay que cambiar `loadRaw()` en `src/lib/content.ts`.
