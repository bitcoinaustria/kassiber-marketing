import { defineConfig } from "astro/config";

// Absolute URLs for canonical/og tags. SITE_URL can override (e.g. previews),
// but the production domain is the default — a localhost fallback here ships
// broken og:image URLs whenever the build env lacks the Vercel variables.
const site = process.env.SITE_URL ?? "https://kassiber.app";

export default defineConfig({
  site,
  server: {
    port: Number(process.env.PORT ?? 4173),
  },
});
