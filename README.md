# Snowmoon, read night by night

A single-page, game-like reader for Vitalik Buterin's short story **Snowmoon**: all 32
chapters in order, presented as thirty-two nights, one scene at a time, with a progress bar,
a "Night complete" card between chapters, optional "What just happened" notes under the
denser scenes, and small attention choices that never leave the canon path. No wallet, no
token, no backend, no analytics; your reading position lives in your browser only.

The story text is the author's, verbatim, under the GNU GPL v3. This reader and everything
in this repository are under the same license (see `LICENSE`). The pipeline that produced
it is disclosed in `PROMPTS.md`, as the author's license note asks.

## Layout of the repository

| Path | What it is |
| --- | --- |
| `dist/` | The committed production export (`dist/index.html` + `dist/assets/`). Relative asset URLs, so it works from an IPFS gateway subpath, an ENS name or any static folder. |
| `web/` | The Vite + React + TypeScript source. |
| `web/src/content/chapters/*.json` | One generated file per chapter: scenes with the upstream HTML. |
| `web/src/content/index.json` | Chapter metadata (place, date, word counts, scene list). |
| `web/src/content/recaps.ts`, `beats.ts` | The hand-written summaries and attention choices (not the author's words). |
| `web/source/upstream/` | Vendored copies of the pinned upstream chapter pages the content is extracted from. |
| `web/scripts/extract-chapters.mjs` | Turns the upstream pages into the chapter JSON. |
| `web/test/` | vitest suites (content integrity, router/progress logic, full reader walk-through). |
| `DESIGN.md` | Tokens, typography, components and responsive behavior of the final source. |
| `PROMPTS.md` | The assignment, the tools, and how the AI worker interpreted it. |
| `artifacts/validation.md` | The Better Interface review record and the validation log. |

## Install

Requires Node 22 or newer and npm (the lockfile is `web/package-lock.json`).

```sh
cd web
npm ci
```

## Preview

Development server with hot reload:

```sh
cd web
npm run dev
```

Preview the committed production export exactly as it will be served:

```sh
cd web
npm run preview        # serves ../dist on a local port
```

Any static file server pointed at `dist/` works too, for example `npx serve dist` from the
repository root. Navigation is hash-based (`#/night/3/2` is Night 3, scenes 1–2 revealed),
so no rewrite rules are needed.

## Rebuild

```sh
cd web
npm run extract        # regenerate src/content from web/source/upstream (optional)
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run build          # writes ../dist (cleans it first)
```

`npm run check` runs typecheck, tests and build in that order. To refresh the vendored
upstream pages from the pinned commit, run `node scripts/extract-chapters.mjs --fetch`
(needs network; the commit hash is fixed inside the script).

## Publish

The publisher serves the committed `dist/` folder as-is; it does not rebuild. After any
source change, rebuild and commit `dist/` together with the source and the lockfile.

- **IPFS:** add the `dist/` directory (for example `ipfs add -r dist`) and pin it under the
  label `snowmoon-flow`. The export uses `./` relative URLs, so it works at
  `https://<gateway>/ipfs/<cid>/` without any path configuration.
- **GitHub Pages or any static host:** serve `dist/` as the site root, or as a subfolder;
  the relative URLs cover both.

## Validation performed

Run on 29 September 2026 with Node 22.23, Vite 7.3, React 19.3, TypeScript 5.9, vitest 3.2:

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | passes, no errors |
| Unit and interaction tests | `npm test` | 3 files, 17 tests pass (includes a jsdom walk through all 32 nights: every Continue, every choice, every "Finish Night", ending reached; and a verbatim-text comparison of every chapter against the upstream page) |
| Production build | `npm run build` | succeeds; `dist/` is about 1.8 MB, one chunk per chapter loaded on demand |
| Browser inspection of `dist/` | Playwright browser tool at 1280×720, 375×740 and 320×640 | no console errors, no horizontal overflow at 320 px, `prefers-reduced-motion` removes the snow canvas and all SMIL animation |

Details, the Better Interface review coverage, findings and remaining limitations are in
`artifacts/validation.md`.

## Credits

Story © Vitalik Buterin, GPL v3, from
[vbuterin/blog `site/snowmoon`](https://github.com/vbuterin/blog/tree/5c6b6d0808ef271d09bb1182ab8697542ee7058d/site/snowmoon).
Reader built by an AI worker on the IdentityMD network (see `PROMPTS.md`). Fonts: EB
Garamond and Cormorant Garamond, SIL OFL.
