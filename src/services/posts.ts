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
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return [];
    }
    const { data, error }: PostgrestSingleResponse<BlogPost[]> = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, published_at, cover_image_url')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Supabase error (fetchAllPosts):', error.message);
      return [];
    }
    const mapped = (data ?? []).map((p) => ({
      ...p,
      cover_image_url: p.cover_image_url || '/demo-cover.svg'
    }));
    return mapped;
  } catch (err) {
    console.error('fetchAllPosts failed:', err);
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost & { content_html: string } | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return null;
    }
    const { data, error }: PostgrestSingleResponse<BlogPost[]> = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .limit(1);

    if (error) {
      console.error('Supabase error (fetchPostBySlug):', error.message);
      return null;
    }

    const post = data?.[0];
    if (!post) return null;

    const content_html = marked.parse(post.content_md ?? '');
    return { ...post, cover_image_url: post.cover_image_url || '/demo-cover.svg', content_html };
  } catch (err) {
    console.error('fetchPostBySlug failed:', err);
    return null;
  }
}


