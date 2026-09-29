# Prompts, scripts and harness used to build this site

Snowmoon is published under the GNU GPL v3, and its author asks that anyone who turns it
into something else open-source the pipeline they used. This file is that disclosure for
the reader in this repository.

## Who built what

- **Story text:** Vitalik Buterin, untouched. Every word of prose comes verbatim from
  `site/snowmoon/html/chapter-N.html` at commit `5c6b6d0808ef271d09bb1182ab8697542ee7058d`
  of <https://github.com/vbuterin/blog>. The copies used are vendored in
  `web/source/upstream/` and a test (`web/test/content.test.ts`) asserts that the text
  shown by the reader equals the upstream page text, chapter by chapter.
- **Reader, styles, scripts, tests, recaps, flavor beats, documentation:** written by an AI
  worker (Anthropic Claude, model `claude-fable-5-1`, running inside Claude Code on an
  IdentityMD contributor seat) in one unattended session on 29 September 2026, from the
  assignment below. No human edited the output before submission. The "What just happened"
  recaps in `web/src/content/recaps.ts` and the attention-choice beats in
  `web/src/content/beats.ts` are the worker's own summaries and paraphrases of the story;
  they are not the author's words and they never replace the text.
- **Fonts:** EB Garamond and Cormorant Garamond, SIL Open Font License, downloaded as latin
  woff2 subsets from Google Fonts (see `web/src/assets/fonts/OFL-*.txt`).

## The assignment (prompt given to the worker)

The worker received the following task text, together with the IdentityMD contributor
rules (allowed paths, size limit, no wallet/backend/tracking) and a pinned copy of the
Better Interface design guide (Jakub Krehel's Better Interface, MIT, adapted for IMD; its
`document-web-design` section adapts Paul Bakaus's Impeccable, Apache-2.0):

> Build a polished interactive explainer website of Vitalik Buterin's Snowmoon short story.
>
> SOURCE (do not invent plot/lore beyond this):
> https://github.com/vbuterin/blog/tree/5c6b6d0808ef271d09bb1182ab8697542ee7058d/site/snowmoon
> Commit 5c6b6d0808ef271d09bb1182ab8697542ee7058d — read site/snowmoon/index.html. Keep
> Vitalik's prose; light edits only for scannability. Cover all 32 chapters in order.
>
> GPL v3: publish full site source on GitHub; include any prompts/scripts/harness used so
> others can rebuild.
>
> Site: single-page game-like reader for a general audience. Chapter-by-chapter continue,
> progress bar, optional "what just happened" under abstract scenes (never instead of the
> text). Flavor choices OK if they stay on the canon path. Not an RPG. No wallet, token,
> backend, or tracking.
>
> Look: quiet winter night — snow, moonlight, soft contrast, literary/magical. Mobile-first,
> accessible, reduced-motion friendly. five nights at freddy vibe.
>
> Deliver: Vite + React static site, GitHub on, IPFS label snowmoon-flow.
>
> Done when: all 32 chapters playable in order on one page; story text present; builds
> clean on phone and desktop.

Acceptance criteria attached to the task asked for: a usable site with working primary
interactions and responsive layouts; `dist/` committed with relative asset URLs; a
production build, typecheck and interaction validation with recorded results; a review
against the six Better Interface domains with fixes and recorded coverage; `DESIGN.md`
documenting the implemented tokens, typography, components and responsive behavior; and a
README explaining install, preview, rebuild and publish.

## How the worker interpreted it

- "Game-like" and "five nights at freddy vibe" became: chapters presented as **Nights 1–32**,
  a title screen with Begin/Continue, a "Night N complete" interstitial card between
  chapters, scene-by-scene reveal with a Continue button, a progress bar and a filling
  moon, and a dark, quiet, snowy palette. Nothing jump-scares; the vibe is the countdown,
  not the horror.
- "Flavor choices on the canon path" became small "where does your attention go?" prompts
  between scenes. Both answers lead to the same next scene and the aside they produce
  restates something the text itself says.
- "What just happened" became a closed `<details>` under scenes that lean on invented
  mechanisms (Steering rubrics, Minpentai, mixnets, obfuscated models, and so on) and a
  chapter recap on the night-complete card. The text is always shown in full first.
- "Light edits for scannability" were kept structural only: splitting chapters at the
  author's own scene breaks, turning decorative `<button>`/`<input>` drawn inside fictional
  device screens into non-interactive spans, prefixing SVG ids so illustrations do not
  collide on one page, and recolouring one blinking terminal prompt that was unreadable on
  a dark background. No sentence was rewritten.

## Scripts

- `web/scripts/extract-chapters.mjs` — converts the vendored upstream chapter pages into
  `web/src/content/chapters/chapter-NN.json` and `web/src/content/index.json`. Run with
  `npm run extract` (or `node scripts/extract-chapters.mjs --fetch` to re-download the pinned
  files first).
- `web/test/*.test.ts(x)` — vitest suites: content integrity against upstream, router and
  progress logic, and a jsdom walk through all 32 nights clicking Continue and the choices.
- Fonts were fetched once with `curl` from the Google Fonts CSS API (latin subset URLs) and
  committed; no network is needed to build.

## Tools available to the worker

Claude Code with file, shell and a Playwright-based browser tool (used to inspect the built
export at 1280, 375 and 320 CSS pixels wide, to emulate `prefers-reduced-motion`, and to
walk the primary interactions). Node 22, npm, Vite 7, React 19, TypeScript 5.9, vitest 3.
