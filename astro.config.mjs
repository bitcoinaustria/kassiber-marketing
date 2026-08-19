import { defineConfig } from "astro/config";
import { readFile, writeFile } from "node:fs/promises";

// Absolute URLs for canonical/og tags. SITE_URL can override (e.g. previews),
// but the production domain is the default — a localhost fallback here ships
// broken og:image URLs whenever the build env sets nothing.
const site = process.env.SITE_URL ?? "https://kassiber.app";

// The homepage's first fold is fully covered by home-critical.css. Keep the
// rest out of the render path, then apply it on interaction or after 3.5s;
// noscript still receives the ordinary stylesheets.
const deferHomepageStyles = {
  name: "defer-homepage-styles",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const path = new URL("index.html", dir);
      let html = await readFile(path, "utf8");
      const critical = await readFile(
        new URL("./src/styles/home-critical.css", import.meta.url),
        "utf8",
      );
      html = html.replace(
        "</head>",
        `<style>${critical}</style></head>`,
      );
      html = html.replace(
        /<link rel="stylesheet" href="([^"]+)">/g,
        (_, href) =>
          `<template data-deferred-style><link rel="stylesheet" href="${href}"${href.includes("/index.") ? " data-home-style" : ""}></template><noscript><link rel="stylesheet" href="${href}"></noscript>`,
      );
      html = html.replace(
        "</head>",
        `<script>addEventListener("DOMContentLoaded",()=>{let done=false;const apply=()=>{if(done)return;done=true;for(const t of document.querySelectorAll("template[data-deferred-style]")){const l=t.content.firstElementChild;l.fetchPriority="low";if(l.hasAttribute("data-home-style"))l.addEventListener("load",()=>document.documentElement.classList.add("home-ready"),{once:true});t.replaceWith(l)}};setTimeout(apply,3500);addEventListener("scroll",apply,{once:true,passive:true});addEventListener("pointerdown",apply,{once:true});addEventListener("keydown",apply,{once:true})},{once:true})</script></head>`,
      );
      await writeFile(path, html);
    },
  },
};

export default defineConfig({
  site,
  integrations: [deferHomepageStyles],
  build: {
    inlineStylesheets: "never",
  },
  server: {
    port: Number(process.env.PORT ?? 4173),
  },
});
