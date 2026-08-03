# Kassiber marketing site

Standalone Astro source for the Kassiber marketing site.

Based on the marketing site from the upstream
[`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) repository. Thanks to
the T3 Code contributors for making their work available under the MIT license.

The site is licensed under the original MIT license in [LICENSE](LICENSE).
The source has intentionally been reduced to the marketing app: it excludes
the coding-agent server, desktop app, and workspace packages. As a result, it
does not publish the upstream `t3.json` editor-schema endpoint.

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
