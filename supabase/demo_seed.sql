-- Demo seed for Austrik template (21 posts)
-- Safe to run multiple times: uses upsert by slug

-- Ensure function exists (also defined in migrations)
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

-- Seed data (21 posts)
select upsert_post('hola-mundo','Hola Mundo','Primer post de ejemplo','# Hola Mundo\n\nEste es un post de **ejemplo** en Markdown.',null,'2025-01-01T10:00:00Z');
select upsert_post('post-1','Post 1','Extracto del post 1','# Post 1\n\nContenido de ejemplo para el post 1.',null,'2025-01-02T10:00:00Z');
select upsert_post('post-2','Post 2','Extracto del post 2','# Post 2\n\nContenido de ejemplo para el post 2.',null,'2025-01-03T10:00:00Z');
select upsert_post('post-3','Post 3','Extracto del post 3','# Post 3\n\nContenido de ejemplo para el post 3.',null,'2025-01-04T10:00:00Z');
select upsert_post('post-4','Post 4','Extracto del post 4','# Post 4\n\nContenido de ejemplo para el post 4.',null,'2025-01-05T10:00:00Z');
select upsert_post('post-5','Post 5','Extracto del post 5','# Post 5\n\nContenido de ejemplo para el post 5.',null,'2025-01-06T10:00:00Z');
select upsert_post('post-6','Post 6','Extracto del post 6','# Post 6\n\nContenido de ejemplo para el post 6.',null,'2025-01-07T10:00:00Z');
select upsert_post('post-7','Post 7','Extracto del post 7','# Post 7\n\nContenido de ejemplo para el post 7.',null,'2025-01-08T10:00:00Z');
select upsert_post('post-8','Post 8','Extracto del post 8','# Post 8\n\nContenido de ejemplo para el post 8.',null,'2025-01-09T10:00:00Z');
select upsert_post('post-9','Post 9','Extracto del post 9','# Post 9\n\nContenido de ejemplo para el post 9.',null,'2025-01-10T10:00:00Z');
select upsert_post('post-10','Post 10','Extracto del post 10','# Post 10\n\nContenido de ejemplo para el post 10.',null,'2025-01-11T10:00:00Z');
select upsert_post('post-11','Post 11','Extracto del post 11','# Post 11\n\nContenido de ejemplo para el post 11.',null,'2025-01-12T10:00:00Z');
select upsert_post('post-12','Post 12','Extracto del post 12','# Post 12\n\nContenido de ejemplo para el post 12.',null,'2025-01-13T10:00:00Z');
select upsert_post('post-13','Post 13','Extracto del post 13','# Post 13\n\nContenido de ejemplo para el post 13.',null,'2025-01-14T10:00:00Z');
select upsert_post('post-14','Post 14','Extracto del post 14','# Post 14\n\nContenido de ejemplo para el post 14.',null,'2025-01-15T10:00:00Z');
select upsert_post('post-15','Post 15','Extracto del post 15','# Post 15\n\nContenido de ejemplo para el post 15.',null,'2025-01-16T10:00:00Z');
select upsert_post('post-16','Post 16','Extracto del post 16','# Post 16\n\nContenido de ejemplo para el post 16.',null,'2025-01-17T10:00:00Z');
select upsert_post('post-17','Post 17','Extracto del post 17','# Post 17\n\nContenido de ejemplo para el post 17.',null,'2025-01-18T10:00:00Z');
select upsert_post('post-18','Post 18','Extracto del post 18','# Post 18\n\nContenido de ejemplo para el post 18.',null,'2025-01-19T10:00:00Z');
select upsert_post('post-19','Post 19','Extracto del post 19','# Post 19\n\nContenido de ejemplo para el post 19.',null,'2025-01-20T10:00:00Z');
select upsert_post('post-20','Post 20','Extracto del post 20','# Post 20\n\nContenido de ejemplo para el post 20.',null,'2025-01-21T10:00:00Z');
