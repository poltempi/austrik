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
 
## Crear las tablas en Supabase (paso a paso, sin programar)

Si prefieres no usar migraciones, puedes crear todo desde el navegador pegando este SQL en Supabase → SQL Editor → Run.

Qué hace este script:
- Crea `categories` y la relación `posts.category_id`.
- Crea `posts` con política de lectura pública para posts publicados.
- Define `upsert_post_with_category` (recibe el nombre de categoría y lo crea si no existe).
- Inserta categorías `Health` y `Mindset`.
- Inserta 20 posts de ejemplo en inglés con contenido Markdown e imágenes de Unsplash.

Pasos:
1) Entra a tu proyecto Supabase → SQL Editor.
2) Copia/pega todo el bloque siguiente y pulsa Run.
3) Comprueba datos en Table editor → `posts` y `categories`.

```sql
[... SQL pasted here in next section ...]
```

Código SQL (copia real):

```sql
create extension if not exists "pgcrypto";

-- Categorías
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null
);
create index if not exists categories_name_idx on public.categories (name);
insert into public.categories (name, description)
values
  ('Health', 'Articles about physical well-being, treatments for diseases, medical conditions, and aesthetic procedures.'),
  ('Mindset', 'Content focused on personal development, mental tools, perspective shifts, and inner growth.')
on conflict (name) do nothing;

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_image_url text,
  published_at timestamptz,
  category_id uuid references public.categories(id)
);
alter table public.posts enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'read_published_posts'
  ) then
    create policy "read_published_posts"
    on public.posts for select
    to public
    using (published_at is not null and published_at <= now());
  end if;
end $$;
create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_category_id_idx on public.posts (category_id);

-- Upsert con nombre de categoría
create or replace function public.upsert_post_with_category(
  p_slug text,
  p_title text,
  p_excerpt text,
  p_content_md text,
  p_cover_image_url text,
  p_published_at timestamptz,
  p_category_name text
) returns void as $$
declare v_cat_id uuid; begin
  if p_category_name is not null then
    insert into public.categories (name, description) values (p_category_name, '') on conflict (name) do nothing;
    select id into v_cat_id from public.categories where name = p_category_name;
  end if;
  insert into public.posts (slug, title, excerpt, content_md, cover_image_url, published_at, category_id)
  values (p_slug, p_title, p_excerpt, p_content_md, p_cover_image_url, p_published_at, v_cat_id)
  on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_md = excluded.content_md,
    cover_image_url = excluded.cover_image_url,
    published_at = excluded.published_at,
    category_id = coalesce(excluded.category_id, public.posts.category_id);
end; $$ language plpgsql security definer;

-- 20 posts demo (muestras)
select public.upsert_post_with_category('unlocking-your-mind-how-shifting-your-perspective-boosts-creativity','Unlocking Your Mind: How Shifting Your Perspective Boosts Creativity.','Practical notes on changing perspective to spark ideas.','# Unlocking Your Mind\n\nChanging how we frame a problem often changes the solution.','https://source.unsplash.com/1600x900/?creativity,brain,ideas','2025-02-01T10:00:00Z','Mindset');
select public.upsert_post_with_category('the-power-of-reframing-turning-challenges-into-opportunities','The Power of Reframing: Turning Challenges into Opportunities.','Reframing tough problems to uncover better options.','# The Power of Reframing\n\nA practical guide with real examples.','https://source.unsplash.com/1600x900/?mindset,opportunity','2025-02-02T10:00:00Z','Mindset');
select public.upsert_post_with_category('a-shift-in-perspective-how-empathy-can-transform-relationships','A Shift in Perspective: How Empathy Can Transform Relationships.','Empathy as a tool to reframe everyday conflicts.','# Empathy\n\nSeeing the situation from the other side often changes the next step.','https://source.unsplash.com/1600x900/?empathy,people','2025-02-03T10:00:00Z','Mindset');
select public.upsert_post_with_category('navigating-change-why-a-growth-mindset-matters','Navigating Change: Why a Growth Mindset Matters.','Growth mindset to adapt faster with less stress.','# Growth Mindset\n\nSmall practice beats big theory.','https://source.unsplash.com/1600x900/?growth,mindset','2025-02-04T10:00:00Z','Mindset');
select public.upsert_post_with_category('mental-models-tools-for-clear-and-effective-thinking','Mental Models: Tools for Clear and Effective Thinking.','Using models to reason better under uncertainty.','# Mental Models\n\nBorrow and adapt proven patterns.','https://source.unsplash.com/1600x900/?strategy,thinking','2025-02-05T10:00:00Z','Mindset');
select public.upsert_post_with_category('strategies-to-broaden-your-perspective-and-see-the-big-picture','Strategies to Broaden Your Perspective and See the Big Picture.','Tools to avoid tunnel vision.','# Big Picture\n\nZoom out before you zoom in.','https://source.unsplash.com/1600x900/?horizon,panorama','2025-02-06T10:00:00Z','Mindset');
select public.upsert_post_with_category('the-art-of-letting-go-how-changing-your-perspective-reduces-stress','The Art of Letting Go: How Changing Your Perspective Reduces Stress.','Letting go as a performance tool.','# Letting Go\n\nRelease to move forward.','https://source.unsplash.com/1600x900/?calm,meditation','2025-02-07T10:00:00Z','Mindset');
select public.upsert_post_with_category('disruptive-thinking-how-to-adopt-an-innovators-perspective','Disruptive Thinking: How to Adopt an Innovator''s Perspective.','Invent like a beginner, execute like a pro.','# Disruptive Thinking\n\nBreak patterns safely.','https://source.unsplash.com/1600x900/?innovation,lightbulb','2025-02-08T10:00:00Z','Mindset');
select public.upsert_post_with_category('embracing-radical-ideas-and-stepping-outside-the-box','Embracing Radical Ideas and Stepping Outside the Box.','When to go bold and how to de‑risk.','# Radical Ideas\n\nThink different, test fast.','https://source.unsplash.com/1600x900/?abstract,color','2025-02-09T10:00:00Z','Mindset');
select public.upsert_post_with_category('adopting-a-long-term-perspective-in-decision-making','Adopting a Long-Term Perspective in Decision-Making.','Avoid short‑termism.','# Long Term\n\nDecide for the future you want.','https://source.unsplash.com/1600x900/?mountain,trail','2025-02-10T10:00:00Z','Mindset');
select public.upsert_post_with_category('a-guide-to-blepharoplasty-eyelid-surgery','A Guide to Blepharoplasty (Eyelid Surgery).','Basics, risks and recovery.','# Blepharoplasty\n\nPlain‑language overview.','https://source.unsplash.com/1600x900/?eyelids,clinic','2025-02-11T10:00:00Z','Health');
select public.upsert_post_with_category('a-guide-to-pdo-thread-lifts','A Guide to PDO Thread Lifts.','What to expect and typical results.','# PDO Threads\n\nKey questions to ask.','https://source.unsplash.com/1600x900/?aesthetics,dermatology','2025-02-12T10:00:00Z','Health');
select public.upsert_post_with_category('laser-eye-surgery-options-and-offers','Laser Eye Surgery: Options and Offers.','Comparing options and candidacy.','# Laser Eye Surgery\n\nTalk to your ophthalmologist.','https://source.unsplash.com/1600x900/?laser,ophthalmology','2025-02-13T10:00:00Z','Health');
select public.upsert_post_with_category('effective-treatments-for-macular-degeneration','Effective Treatments for Macular Degeneration.','Current standards of care.','# Macular Degeneration\n\nOptions and follow‑up.','https://source.unsplash.com/1600x900/?eye,retina','2025-02-14T10:00:00Z','Health');
select public.upsert_post_with_category('osteoporosis-effective-treatments-and-breakthroughs','Osteoporosis: Effective Treatments and Breakthroughs.','Prevention and treatment basics.','# Osteoporosis\n\nBone health matters.','https://source.unsplash.com/1600x900/?bone,health','2025-02-15T10:00:00Z','Health');
select public.upsert_post_with_category('understanding-ductal-carcinoma-types-treatments-and-costs','Understanding Ductal Carcinoma: Types, Treatments, and Costs.','Plain‑language summary.','# Ductal Carcinoma\n\nTalk with your oncologist.','https://source.unsplash.com/1600x900/?oncology,clinic','2025-02-16T10:00:00Z','Health');
select public.upsert_post_with_category('exploring-alzheimers-treatment-understanding-and-managing-the-disease','Exploring Alzheimer''s Treatment: Understanding and Managing the Disease.','What families ask most.','# Alzheimer''s\n\nCare and options overview.','https://source.unsplash.com/1600x900/?alzheimer,care','2025-02-17T10:00:00Z','Health');
select public.upsert_post_with_category('a-guide-to-stomach-cancer-treatments','A Guide to Stomach Cancer Treatments.','First‑line and second‑line options.','# Stomach Cancer\n\nDiscuss screening and follow‑up.','https://source.unsplash.com/1600x900/?oncology,hospital','2025-02-18T10:00:00Z','Health');
select public.upsert_post_with_category('metastatic-prostate-cancer-treatment','Metastatic Prostate Cancer Treatment.','Latest approaches and trials.','# Prostate Cancer\n\nAsk about side effects.','https://source.unsplash.com/1600x900/?hospital,doctor','2025-02-19T10:00:00Z','Health');
select public.upsert_post_with_category('understanding-gout-and-its-effective-treatments','Understanding Gout and Its Effective Treatments.','What actually works and when.','# Gout\n\nLifestyle + medicine overview.','https://source.unsplash.com/1600x900/?gout,foot,pain','2025-02-20T10:00:00Z','Health');
```

