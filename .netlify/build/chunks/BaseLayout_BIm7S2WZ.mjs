import { c as createComponent, d as createAstro, f as addAttribute, j as renderHead, k as renderSlot, r as renderTemplate } from './astro/server_Ki99vwta.mjs';
import 'kleur/colors';
import 'clsx';

const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Austrik", description = "Blog", image = "/favicon.svg" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(image, "content")}>${renderHead()}</head> <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; margin: 0;"> <header style="padding: 1rem 1.25rem; border-bottom: 1px solid #e5e7eb;"> <a href="/" style="text-decoration: none; color: inherit;"><strong>Austrik</strong></a> </header> <main style="padding: 1.25rem; max-width: 900px; margin: 0 auto;"> ${renderSlot($$result, $$slots["default"])} </main> <footer style="padding: 1rem 1.25rem; border-top: 1px solid #e5e7eb; color: #6b7280;">
© ${(/* @__PURE__ */ new Date()).getFullYear()} Austrik
</footer> </body></html>`;
}, "/Users/es00500546/Desktop/Proyectos/Austrik/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
