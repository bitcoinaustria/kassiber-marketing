# Kassiber marketing site

Standalone Astro source for the Kassiber marketing site.

Kassiber was vibed with [T3 Code](https://github.com/pingdotgg/t3code), whose
awesome open-source work provided the upstream foundation for this marketing
site. Huge thanks to the T3 Code contributors for making it available under the
MIT license. If you like how Kassiber looks and feels, go check out T3 Code.

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
