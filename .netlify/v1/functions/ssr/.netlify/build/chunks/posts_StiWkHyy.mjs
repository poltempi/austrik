import { marked } from 'marked';

function getSupabaseClient() {
  {
    throw new Error(
      "Faltan variables de entorno PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY. Configúralas en tu entorno local (.env) y en Netlify."
    );
  }
}

async function fetchAllPosts() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("posts").select("id, slug, title, excerpt, published_at, cover_image_url").order("published_at", { ascending: false });
  if (error) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
  return data ?? [];
}
async function fetchPostBySlug(slug) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).limit(1);
  if (error) {
    throw new Error(`Error fetching post: ${error.message}`);
  }
  const post = data?.[0];
  if (!post) return null;
  const content_html = marked.parse(post.content_md ?? "");
  return { ...post, content_html };
}

export { fetchAllPosts as a, fetchPostBySlug as f };
