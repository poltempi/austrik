-- Add category_name to posts and keep category_id for backward compatibility
create extension if not exists "pgcrypto";

-- 1) Add column if missing
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'category_name'
  ) then
    alter table public.posts add column category_name text;
  end if;
end $$;

-- 2) Backfill from existing category_id
update public.posts p
set category_name = c.name
from public.categories c
where p.category_id is not null and c.id = p.category_id and (p.category_name is null or p.category_name = '');

-- 3) Reference by name and index
alter table public.posts
  add constraint posts_category_name_fkey
  foreign key (category_name) references public.categories(name) on update cascade on delete set null;

create index if not exists posts_category_name_idx on public.posts (category_name);

-- 4) Helper trigger to keep category_id in sync when category_name is edited manually
create or replace function public.posts_sync_category_id()
returns trigger as $$
declare v_id uuid; begin
  if new.category_name is not null then
    select id into v_id from public.categories where name = new.category_name;
    new.category_id := v_id; -- may set null if not found
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_posts_sync_category_id on public.posts;
create trigger trg_posts_sync_category_id
before insert or update of category_name on public.posts
for each row execute function public.posts_sync_category_id();


