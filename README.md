# Austrik Blog (Astro + Supabase + Netlify)

## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/poltempi/austrik)

Si haces clic en el botón anterior, Netlify creará un nuevo repo a partir de este template y quedará listo para desplegar.

### Conectar Supabase (botón rápido)

[![Connect Supabase on Netlify](https://img.shields.io/badge/Connect%20Supabase-00C4B3?logo=supabase&logoColor=white)](https://app.netlify.com/integrations/supabase)

- Abre el enlace, pulsa "Install/Connect" y selecciona tu sitio (p. ej. `austrik.netlify.app`).
- El vínculo directo de autorización que muestra Netlify (similar a `https://supabase.com/dashboard/authorize?auth_id=...`) es temporal y específico de tu sesión; por eso este botón apunta a la página oficial de la integración de Supabase en Netlify.

## Entorno

1. Copia `.env.example` a `.env` y rellena:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

2. Instala dependencias y arranca desarrollo:

```
npm i
npm run dev
```

## Datos en Supabase

Tabla `posts` sugerida:

```
id: uuid (primary key)
slug: text (unique)
title: text
excerpt: text
content_md: text
published_at: timestamptz
cover_image_url: text
```

Los cambios Google Sheets → Make → Supabase se reflejan automáticamente en local y producción gracias a SSR y cabeceras `no-store`.

## Deploy en Netlify

1. Conecta el repo y define variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
2. Build command: `npm run build`
3. Publish directory: `dist`

## Developing locally (Netlify flow recomendado)

Prerequisitos:
- Node.js v18.14+
- Netlify CLI
- Cuenta de Supabase y Netlify

1. Instala Netlify CLI y dependencias
```bash
npm i -g netlify-cli@latest
npm i
```
2. Linkea el repo local con el sitio en Netlify (si lo has creado via botón)
```bash
netlify link
```
3. Ejecuta el dev server usando Netlify runtime (para emular el entorno)
```bash
netlify dev --target-port 4321
```

## Base de datos (migraciones y seed)
- Ejecuta en Supabase UI el SQL de `supabase/migrations/0001_posts.sql`.
- Opcional: importa `supabase/seed.csv` para contenido de prueba.

