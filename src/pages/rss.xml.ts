import type { APIRoute } from 'astro';
import { fetchAllPosts } from '../services/posts';

export const GET: APIRoute = async ({ site }) => {
  const posts = await fetchAllPosts();

  const items = posts
    .map((p) => {
      const url = new URL(`/${p.slug}/`, site ?? 'https://example.com');
      return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${url}</link>
        <guid>${url}</guid>
        ${p.excerpt ? `<description><![CDATA[${p.excerpt}]]></description>` : ''}
        ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ''}
      </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Austrik Blog</title>
      <link>${site ?? 'https://example.com'}</link>
      <description>RSS del blog Austrik</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
};


