import { createClient } from '@supabase/supabase-js';

function getEnv(name, fallbackNames = []) {
  if (process.env[name]) return process.env[name];
  for (const alt of fallbackNames) {
    if (process.env[alt]) return process.env[alt];
  }
  return undefined;
}

const supabaseUrl = getEnv('SUPABASE_URL', ['PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(String(supabaseUrl), String(serviceRoleKey));

function buildPosts() {
  const posts = [];
  posts.push({
    slug: 'hola-mundo',
    title: 'Hola Mundo',
    excerpt: 'Primer post de ejemplo',
    content_md: '# Hola Mundo\n\nEste es un post de **ejemplo** en Markdown.',
    cover_image_url: null,
    published_at: '2025-01-01T10:00:00Z'
  });

  for (let i = 1; i <= 20; i++) {
    const idx = i;
    const day = String(i + 1).padStart(2, '0');
    posts.push({
      slug: `post-${idx}`,
      title: `Post ${idx}`,
      excerpt: `Extracto del post ${idx}`,
      content_md: `# Post ${idx}\n\nContenido de ejemplo para el post ${idx}.`,
      cover_image_url: null,
      published_at: `2025-01-${day}T10:00:00Z`
    });
  }
  return posts;
}

async function main() {
  const posts = buildPosts();
  const { error, count } = await supabase
    .from('posts')
    .upsert(posts, { onConflict: 'slug', ignoreDuplicates: false, count: 'exact' });

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
  console.log(`Seed completed. Upserted ${posts.length} posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


