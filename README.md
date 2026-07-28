# T3 Code marketing site

Standalone Astro source for the T3 Code marketing site, extracted from
[`pingdotgg/t3code`](https://github.com/pingdotgg/t3code).

The site is licensed under the original MIT license in [LICENSE](LICENSE).
The source has intentionally been reduced to the marketing app: it excludes
the coding-agent server, desktop app, and workspace packages. As a result, it
does not publish the upstream `t3.json` editor-schema endpoint.

## Development

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

## Verification

```sh
npm run typecheck
npm run build
```
