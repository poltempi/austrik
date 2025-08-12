import { c as createComponent, d as createAstro, i as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML, f as addAttribute } from '../../chunks/astro/server_Ki99vwta.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_BIm7S2WZ.mjs';
import { f as fetchPostBySlug } from '../../chunks/posts_StiWkHyy.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/", 302);
  }
  Astro2.response.headers.set("Cache-Control", "no-store");
  const post = await fetchPostBySlug(slug);
  if (!post) {
    return new Response("Not Found", { status: 404 });
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": post.title, "description": post.excerpt ?? post.title, "image": post.cover_image_url ?? "/favicon.svg", "data-astro-cid-gysqo7gh": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article data-astro-cid-gysqo7gh> <h1 style="margin-top:0" data-astro-cid-gysqo7gh>${post.title}</h1> ${post.published_at && renderTemplate`<small style="color:#6b7280;" data-astro-cid-gysqo7gh>${new Date(post.published_at).toLocaleDateString("es")}</small>`} ${post.cover_image_url && renderTemplate`<img${addAttribute(post.cover_image_url, "src")}${addAttribute(post.title, "alt")} style="width:100%; height:auto; border-radius:8px; margin:1rem 0;" loading="lazy" data-astro-cid-gysqo7gh>`} <div class="content" data-astro-cid-gysqo7gh>${unescapeHTML(post.content_html)}</div> </article>  ` })}`;
}, "/Users/es00500546/Desktop/Proyectos/Austrik/src/pages/posts/[slug].astro", void 0);

const $$file = "/Users/es00500546/Desktop/Proyectos/Austrik/src/pages/posts/[slug].astro";
const $$url = "/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
