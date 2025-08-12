# Austrik Blog (Astro + Supabase + Netlify)

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
