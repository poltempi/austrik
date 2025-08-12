import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { marked } from 'marked';
import { getSupabaseClient } from '../lib/supabase';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string; // Markdown source
  published_at: string | null;
  cover_image_url: string | null;
};

export type BlogPostSummary = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'published_at' | 'cover_image_url'>;

export async function fetchAllPosts(): Promise<BlogPostSummary[]> {
  const supabase = getSupabaseClient();
  const { data, error }: PostgrestSingleResponse<BlogPost[]> = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, published_at, cover_image_url')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
  return data ?? [];
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost & { content_html: string } | null> {
  const supabase = getSupabaseClient();
  const { data, error }: PostgrestSingleResponse<BlogPost[]> = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (error) {
    throw new Error(`Error fetching post: ${error.message}`);
  }

  const post = data?.[0];
  if (!post) return null;

  const content_html = marked.parse(post.content_md ?? '');
  return { ...post, content_html };
}


