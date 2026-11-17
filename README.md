# Kassiber marketing site

Standalone Astro source for the Kassiber marketing site.

Kassiber was vibed with [T3 Code](https://github.com/pingdotgg/t3code), and this
website is based on its awesome open-source marketing site. The shoutout goes
beyond the website: T3 Code helped make Kassiber itself happen. Huge thanks to
its contributors for publishing their work under the MIT license. Go check it
out.

The website source is licensed under the original MIT license in
[LICENSE](LICENSE).

## Development

Requires Node.js 24 or newer.

```sh
pnpm install
pnpm run dev
```

## Verification

```sh
pnpm run typecheck
pnpm run build
```

## Deployment

The site is a static-assets-only Cloudflare Worker (`wrangler.jsonc`), deployed
by Workers Builds from the GitHub repo:

- pushes to `main` build and deploy to production (`kassiber.app`)
- every other branch (including PR branches) uploads a preview version, and
  Cloudflare comments the preview URL on the PR

To check the production behaviour locally (404 page, trailing slashes):

```sh
pnpm run preview
```
