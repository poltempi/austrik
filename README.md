# Austrik Blog (Astro + Supabase + Netlify)

Demo: https://austrik.netlify.app/

## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/poltempi/austrik)

Si haces clic en el botón anterior, Netlify creará un nuevo repo a partir de este template y quedará listo para desplegar.

### Conectar Supabase (paso a paso)

Supabase es una plataforma open-source con Postgres, Auth, Storage, realtime y GraphQL.

Ventajas de la integración en Netlify:
- Autenticación por OAuth con tu cuenta de Supabase
- Selección del proyecto Supabase a vincular
- Creación automática de variables de entorno:
  - `SUPABASE_DATABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
- Compatibilidad por framework (o prefijo custom)

Pasos para conectar tu sitio en Netlify con Supabase:
1. Entra en Netlify → Team → Extensions.
2. Busca “Supabase” y pulsa Install.
3. Desde tu lista de Sites, abre tu sitio (por ej. `austrik.netlify.app`).
4. Ve a Project configuration → General → Supabase.
5. Pulsa “Connect” y autoriza con tu cuenta de Supabase.
6. Elige tu proyecto de Supabase y framework/prefijo adecuado.
7. Guarda. La integración creará variables en Project configuration → Environment variables.

Notas:
- La autorización directa `https://supabase.com/dashboard/authorize?auth_id=...` es temporal por sesión, por eso no se incluye botón directo.
- Si no usas la integración, define manualmente las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (también se admiten `PUBLIC_SUPABASE_*`).

## Entorno

1. Crea un archivo `.env` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
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

1. Conecta el repo y define variables (scope Build & Functions):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
- Opcional: importa `supabase/seed.csv` para contenido de prueba (20 posts).

### Script SQL (21 posts demo)

- Archivo: `supabase/demo_seed.sql`
- Uso: abre Supabase → SQL Editor → Upload file → selecciona `supabase/demo_seed.sql` → Run.

### Seed desde el proyecto (usando Service Role)

1. Obtén la `SUPABASE_SERVICE_ROLE_KEY` en Supabase:
   - Ve a Project Settings → API → sección Service Role key.
   - Copia también `Project URL` (tu `SUPABASE_URL`).
2. Exporta variables y ejecuta el seed:
```bash
export SUPABASE_URL="https://<your-project-ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
npm run seed
```
Esto hará upsert de 21 posts (incluye `hola-mundo`).

