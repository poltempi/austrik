-- Categories table and relation from posts
create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null
);

create index if not exists categories_name_idx on public.categories (name);

-- Seed default categories
insert into public.categories (name, description)
values
  ('Health', 'Articles about physical well-being, treatments for diseases, medical conditions, and aesthetic procedures.'),
  ('Mindset', 'Content focused on personal development, mental tools, perspective shifts, and inner growth.')
on conflict (name) do nothing;

-- Add relation from posts to categories
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'category_id'
  ) then
    alter table public.posts add column category_id uuid references public.categories(id);
    create index if not exists posts_category_id_idx on public.posts (category_id);
  end if;
end $$;


