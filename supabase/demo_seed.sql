-- Austrik – Setup completo: tablas + upsert por nombre de categoría + 20 posts demo
-- Seguro de ejecutar varias veces (usa upsert por slug)

create extension if not exists "pgcrypto";

-- 1) Categorías
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default ''
);
create index if not exists categories_name_idx on public.categories (name);

-- 2) Posts (incluye category_name y RLS para lectura pública de posts publicados)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_image_url text,
  published_at timestamptz,
  category_id uuid references public.categories(id),
  category_name text
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

-- FK por nombre (útil para edición manual) + índice
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and table_name = 'posts' and constraint_name = 'posts_category_name_fkey'
  ) then
    alter table public.posts
      add constraint posts_category_name_fkey
      foreign key (category_name) references public.categories(name)
      on update cascade on delete set null;
  end if;
end $$;
create index if not exists posts_category_name_idx on public.posts (category_name);

-- Trigger para sincronizar category_id cuando cambie category_name manualmente
create or replace function public.posts_sync_category_id()
returns trigger as $$
declare v_id uuid; begin
  if new.category_name is not null then
    select id into v_id from public.categories where name = new.category_name;
    new.category_id := v_id;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_posts_sync_category_id on public.posts;
create trigger trg_posts_sync_category_id
before insert or update of category_name on public.posts
for each row execute function public.posts_sync_category_id();

-- 3) Función de upsert aceptando nombre de categoría
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
  insert into public.posts (slug, title, excerpt, content_md, cover_image_url, published_at, category_id, category_name)
  values (p_slug, p_title, p_excerpt, p_content_md, p_cover_image_url, p_published_at, v_cat_id, p_category_name)
  on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_md = excluded.content_md,
    cover_image_url = excluded.cover_image_url,
    published_at = excluded.published_at,
    category_id = coalesce(excluded.category_id, public.posts.category_id),
    category_name = coalesce(excluded.category_name, public.posts.category_name);
end; $$ language plpgsql security definer;

-- 4) Semilla de categorías
insert into public.categories (name, description)
values
  ('Health', 'Articles about physical well-being, treatments for diseases, medical conditions, and aesthetic procedures.'),
  ('Mindset', 'Content focused on personal development, mental tools, perspective shifts, and inner growth.')
on conflict (name) do nothing;

-- 5) 20 posts de ejemplo (en inglés) – usa imágenes de Unsplash por palabra clave
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
