-- Create posts table and RLS policy
create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_image_url text,
  published_at timestamptz
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

-- Optional convenience upsert function for seeding/demo
create or replace function public.upsert_post(
  p_slug text,
  p_title text,
  p_excerpt text,
  p_content_md text,
  p_cover_image_url text,
  p_published_at timestamptz
)
returns void as $$
begin
  insert into public.posts (slug, title, excerpt, content_md, cover_image_url, published_at)
  values (p_slug, p_title, p_excerpt, p_content_md, p_cover_image_url, p_published_at)
  on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content_md = excluded.content_md,
    cover_image_url = excluded.cover_image_url,
    published_at = excluded.published_at;
end;
$$ language plpgsql security definer;


