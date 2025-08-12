import { c as createComponent, d as createAstro, i as renderComponent, r as renderTemplate, m as maybeRenderHead, f as addAttribute } from '../chunks/astro/server_Ki99vwta.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BIm7S2WZ.mjs';
import { a as fetchAllPosts } from '../chunks/posts_StiWkHyy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  Astro2.response.headers.set("Cache-Control", "no-store");
  const posts = await fetchAllPosts();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Austrik Blog", "description": "Noticias y art\xEDculos de Austrik" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 style="margin-top:0">Austrik Blog</h1> ${posts.length === 0 && renderTemplate`<p>No hay posts todavía.</p>`}<ul style="list-style:none; padding:0; display:grid; gap:1.25rem;"> ${posts.map((p) => renderTemplate`<li> <a${addAttribute(`/posts/${p.slug}/`, "href")} style="text-decoration:none; color:inherit;"> <article style="border:1px solid #e5e7eb; border-radius:8px; padding:1rem;"> <h2 style="margin:0 0 .5rem 0;">${p.title}</h2> ${p.excerpt && renderTemplate`<p style="margin:.25rem 0 0 0; color:#4b5563;">${p.excerpt}</p>`} ${p.published_at && renderTemplate`<small style="color:#6b7280;">${new Date(p.published_at).toLocaleDateString("es")}</small>`} </article> </a> </li>`)} </ul> ` })}`;
}, "/Users/es00500546/Desktop/Proyectos/Austrik/src/pages/index.astro", void 0);

const $$file = "/Users/es00500546/Desktop/Proyectos/Austrik/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
