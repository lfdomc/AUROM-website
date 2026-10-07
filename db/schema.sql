-- Opcional: guardar el site.json en Postgres (JSONB) para editar sin desplegar.
create table if not exists sitios (
  id bigserial primary key,
  slug text not null,
  version int not null,
  estado text not null default 'borrador' check (estado in ('borrador','publicado','archivado')),
  contenido jsonb not null,
  creado_en timestamptz not null default now(),
  unique (slug, version),
  constraint contenido_version check (contenido ->> 'version' = '1'),
  constraint contenido_paginas check (jsonb_typeof(contenido -> 'pages') = 'array')
);
create index if not exists sitios_publicado on sitios (slug, version desc) where estado = 'publicado';
create index if not exists sitios_contenido on sitios using gin (contenido jsonb_path_ops);

-- Ejemplos:
-- Bajar la intensidad de animación:
--   update sitios set contenido = jsonb_set(contenido, '{design,dials,motion}', '5') where slug = 'aurom' and version = 2;
-- Páginas con preguntas frecuentes:
--   select p ->> 'slug' from sitios, jsonb_array_elements(contenido -> 'pages') p where p -> 'sections' @> '[{"type":"faq"}]';
