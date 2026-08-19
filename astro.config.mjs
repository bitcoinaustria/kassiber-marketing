import { defineConfig } from "astro/config";
import { readFile, writeFile } from "node:fs/promises";

// Absolute URLs for canonical/og tags. SITE_URL can override (e.g. previews),
// but the production domain is the default — a localhost fallback here ships
// broken og:image URLs whenever the build env sets nothing.
const site = process.env.SITE_URL ?? "https://kassiber.app";

// The homepage's first fold is covered by home-critical.css. Inline font-face
// declarations with optional display so the typeface cannot swap after paint,
// but load the full page stylesheet normally: the inline demos need it before
// they can be laid out.
const optimizeHomepageStyles = {
  name: "optimize-homepage-styles",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const path = new URL("index.html", dir);
      let html = await readFile(path, "utf8");
      const critical = await readFile(
        new URL("./src/styles/home-critical.css", import.meta.url),
        "utf8",
      );
      const stylesheetHrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]
        .map((match) => match[1]);
      const fontStylesheets = new Map();
      await Promise.all(stylesheetHrefs.map(async (href) => {
        const css = await readFile(new URL(href.slice(1), dir), "utf8");
        if (css.includes("@font-face")) {
          fontStylesheets.set(
            href,
            css.replaceAll("font-display:swap", "font-display:optional"),
          );
        }
      }));
      html = html.replace(
        "</head>",
        `<style>${[...fontStylesheets.values()].join("")}${critical}</style></head>`,
      );
      html = html.replace(
        /<link rel="stylesheet" href="([^"]+)">/g,
        (_, href) => fontStylesheets.has(href)
          ? ""
          : `<link rel="stylesheet" href="${href}">`,
      );
      await writeFile(path, html);
    },
  },
};

export default defineConfig({
  site,
  integrations: [optimizeHomepageStyles],
  build: {
    inlineStylesheets: "never",
  },
  server: {
    port: Number(process.env.PORT ?? 4173),
  },
});
