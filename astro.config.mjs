import { defineConfig } from "astro/config";

// Absolute URLs for canonical/og tags. Set SITE_URL once the real domain is
// decided; on Vercel the production domain is picked up automatically.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4173");

export default defineConfig({
  site,
  server: {
    port: Number(process.env.PORT ?? 4173),
  },
});
