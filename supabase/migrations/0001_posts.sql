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


