# Snowmoon Flow — design system as implemented

This documents what the source in `web/src` actually does, so another page can be added
that belongs to the same product. Values are quoted from the files named; nothing here is
aspirational. Browser-observed facts come from the Playwright inspection recorded in
`artifacts/validation.md`.

## Overview

Audience: general readers on phones and desktops, reading a long story in sittings. The
character is a quiet winter night: a near-black blue page, warm off-white serif text, a pale
gold "moonlight" accent used only for the one primary action per view and for links, and
slow sparse snow behind everything. Density is low: one reading column of at most 38rem,
generous vertical rhythm, and only two or three controls visible at a time.

System-wide rules: dark only (`color-scheme: dark`, no light theme), one accent hue, serif
throughout (a display serif for headings, a text serif for everything else), small-caps
labels for metadata, pill buttons, and motion that is opt-in via
`prefers-reduced-motion: no-preference`. The title screen's centered hero and the
night-complete card are page arrangements, not rules.

All tokens live in `web/src/styles/tokens.css`. Global resets, fonts, focus and button
classes live in `web/src/styles/base.css`. Screen and component layout is in
`web/src/styles/app.css`; the styling of the story HTML itself is in
`web/src/styles/story.css`, scoped under `.scene-body`.

## Colors

Primitives are named by hue (`--night-*`, `--snow-*`, `--moon-*`) and never used in
components; components use the semantic tokens below. Notation is `oklch()` everywhere
(the story's own inline speaker colours are also oklch, from upstream).

| Role token | Value (primitive) | Used for |
| --- | --- | --- |
| `--color-bg` | `--night-950` = `oklch(0.13 0.03 268)` | page background (under a fixed gradient set on `body`) |
| `--color-bg-surface` | `--night-900` = `oklch(0.17 0.035 268)` | recap disclosure, night cards in the menu, `<pre>` |
| `--color-bg-raised` | `--night-800` = `oklch(0.21 0.035 268)` | secondary buttons, settings popover |
| `--color-bg-hover` | `--night-700` = `oklch(0.26 0.035 268)` | hover fill of secondary buttons |
| `--color-border` | `--night-600` = `oklch(0.34 0.035 268)` | rules, table borders, the divider above night actions |
| `--color-border-strong` | `--night-500` = `oklch(0.46 0.03 268)` | button outlines, blockquote rule, inactive scene dots |
| `--color-text` | `--snow-100` = `oklch(0.9 0.01 90)` | body text |
| `--color-text-strong` | `--snow-50` = `oklch(0.96 0.008 90)` | headings, button labels, `<strong>` |
| `--color-text-secondary` | `--snow-200` = `oklch(0.79 0.015 260)` | datelines, recap text, lede, ghost buttons |
| `--color-text-muted` | `--snow-300` = `oklch(0.68 0.02 260)` | eyebrow labels, captions, stats |
| `--color-accent` / `--color-accent-solid` | `--moon-200` = `oklch(0.87 0.08 92)` | links; the single filled primary button per view; active scene dot ring |
| `--color-accent-hover` | `--moon-100` = `oklch(0.93 0.06 92)` | link and primary-button hover |
| `--color-on-accent` | `--night-950` | text on the primary button |
| `--color-focus` | `--moon-100` | the 2px focus ring |
| `--color-progress` | `--moon-300` = `oklch(0.8 0.07 92)` | progress bar fill, filled scene dots, the beat aside rule |
| `--color-device-bg`, `-border`, `-ink`, `-head`, `-row`, `-row-alt` | see `tokens.css` | the story's fictional "device screens" (navy panels with light-blue monospace text) |

Measured WCAG 2 contrast of the declared pairs (computed from the token values with
`test/scratch/contrast.mjs`, recorded in `artifacts/validation.md`): body text 14.9:1,
secondary text 9.2–10.4:1, muted text 6.2–7.0:1 on all three surfaces, links 13.6:1,
primary button label 13.6:1, device ink 9.4–10.7:1, the six most-used upstream speaker
colours 7.0–8.1:1 on the page background. The focus ring is drawn with a 3px offset over the
page background (16.4:1); it is not meant to sit on the accent fill.

Gradients: `body` layers two radial glows (`oklch(0.32 0.05 250 / 0.55)` top-right,
`oklch(0.24 0.04 280 / 0.7)` bottom-left) over a vertical `--night-950` → `oklch(0.15 0.035 268)`
gradient, all in the default sRGB interpolation. Snow is drawn on a canvas in
`rgb(236, 240, 255)` at alpha 0.2–0.6.

Do not add a second accent hue, a status ramp, or a light theme; the upstream speaker
colours (twenty-odd `oklch(0.7 0.15 h)` inline spans) are the only other hues on the page.

## Typography

Fonts are self-hosted woff2 in `web/src/assets/fonts/` and declared in `base.css`:

- `EB Garamond` variable (weight axis 400–800) and its italic file: all body and UI text.
  Stack: `'EB Garamond', Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif`.
- `Cormorant Garamond` variable (300–700): headings and the big night numbers.
  Stack: `'Cormorant Garamond', 'EB Garamond', Georgia, serif`.
- `--font-mono`: `'Courier New', Courier, ui-monospace, Menlo, monospace` for the fictional
  device screens (matching upstream). The upstream "handwritten" letters ask for
  `'TeX Gyre Chorus', cursive` inline; that face is not bundled, so they fall back to the
  system cursive face (limitation recorded in validation).

Scale (`tokens.css`), all unitless line heights:

| Token | Size | Role |
| --- | --- | --- |
| `--text-display` | `clamp(3.25rem, 14vw, 6rem)` | title screen name, night-complete number |
| `--text-h1` | `2.5rem` | screen titles, chapter title |
| `--text-h2` | `1.75rem` | night-card numbers, prose h2 |
| `--text-h3` | `1.375rem` | about-page subheadings, story `<h3>` |
| `--text-lead` | `1.25rem` (s: 1.125, l: 1.5) | ledes, large buttons, bar night label |
| `--text-body` | `1.125rem` (s: 1rem, l: 1.3125rem) | story text and prose |
| `--text-ui` | `1rem` | buttons, settings, recap summary |
| `--text-label` | `0.875rem` | datelines in cards, secondary bar text |
| `--text-caption` | `0.8125rem` | eyebrow labels, scene headings |

Headings use `--leading-tight` (1.1), body `--leading-body` (1.6). Headings get
`text-wrap: balance`; descriptions get `text-wrap: pretty`; story paragraphs get neither.
Small-caps labels (`.eyebrow`, `.scene-heading`) are uppercase with
`letter-spacing: 0.14em`. Body text uses old-style numerals; anything that changes or
aligns (`.num`, device screens) switches to `tabular-nums lining-nums`. Font smoothing is
set once on `html`. Measure: `--measure: 38rem` (about 68 characters at the body size).

The reader's text size preference is applied as `html[data-text-size="s|m|l"]` and only
changes `--text-body` and `--text-lead`.

## Layout

Spacing steps are `--space-1` … `--space-8` = 4, 8, 12, 16, 24, 32, 48, 64px (in rem).
Within-group gaps use 8–12px; between groups 24–48px. Page inline padding is
`--page-pad: clamp(1rem, 4vw, 2rem)` plus `env(safe-area-inset-*)`.

- `.screen` is the page primitive: a centered column of `max-width: var(--measure)`,
  `padding: 32px page-pad 64px`, flex column. `.screen-center` centers vertically and
  horizontally (title, night-complete, ending). `.screen-wide` widens to 64rem (nights menu).
- The reader bar (`.reader-bar`) is sticky, 3.5rem tall (`--bar-height`), blurred
  translucent night background, with a 3px progress bar along its bottom edge. `html` has
  `scroll-padding-top` of the bar height plus 1rem so focused headings clear it.
- `.stack` / `.stack-lg` add 16 / 32px between siblings. `.actions` is a wrapping flex row
  of buttons with 12px gaps, centered; `.actions-start` left-aligns it.
- The nights menu is `grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr))`, so it
  is one column under about 32rem, two around 48rem and three or four on desktop.
- Breakpoints come from content, not devices: `40rem` hides the place name in the reader
  bar and lets narrow device screens go full width; `24rem` (320px phones) hides the scene
  dots and the "Display" label so "Night N" is never clipped. Observed in the browser:
  no horizontal overflow at 320px, story SVGs scale down with `max-width: 100%; height: auto`.
- Logical properties are used throughout (`margin-block`, `padding-inline`,
  `inset-inline-end`), so an RTL mirror needs no layout changes (not visually verified).

## Elevation and depth

Mostly flat. Three treatments exist:

- `--shadow-ring`: `0 0 0 1px oklch(1 0 0 / 0.06)`, a hairline light ring used instead of
  a border on night cards, the recap disclosure and the settings popover.
- `--shadow-1`: `0 1px 2px oklch(0 0 0 / 0.35), 0 8px 24px oklch(0 0 0 / 0.35)` for the two
  floating surfaces: the settings popover and the night-complete / ending card.
- Story illustrations (`.scene-body svg`) get a 1px `oklch(1 0 0 / 0.1)` outline and a
  slightly lighter night fill so line art has a defined edge.

Stacking: the snow canvas is `position: fixed; z-index: 0`, `main` sits at `z-index: 1`,
the reader bar at 5, the skip link at 100.

## Shapes

`--radius-sm: 4px` (focus rings, code, decorative device buttons), `--radius-md: 10px`
(night cards, recap, settings segments, `<pre>`), `--radius-lg: 16px` (cards, popover,
device screens), `--radius-pill: 999px` (all buttons, the progress track). Outer radius =
inner radius + padding is followed on the card (16px) → device screen (16px at 16px
padding) → buttons inside (4px).

## Components

All components are plain React function components in `web/src/components/`, styled with
the global classes above. None is exported as a library; reuse them by import.

- **Buttons** (`base.css`): `.btn` base (44px min height, pill, 1px `--color-border-strong`
  outline, `scale: 0.96` on `:active`, hover only under `@media (hover: hover)`),
  `.btn-primary` (filled `--color-accent-solid`, one per view), `.btn-ghost` (transparent),
  sizes `.btn-lg` / `.btn-sm`, `.btn-icon` for icon-only, inline SVG icons inherit
  `currentColor` with 1.75px strokes. Links styled as buttons use the same classes.
- **Reader** (`Reader.tsx`): sticky bar (All nights link, "Night N" + place, scene dots,
  `MoonPhase`, `SettingsPopover`, `role="progressbar"`), night header (eyebrow, `<h1>`
  chapter title, dateline), one `SceneBlock` per revealed scene, then `.night-actions`
  (a beat prompt with two option buttons, or Continue + "Show the whole night", or
  "Finish Night N" plus the chapter recap disclosure), and a footer nav. Focus moves to the
  newly revealed scene heading (`tabIndex={-1}`) and scrolls it under the bar; on a new
  night, focus goes to the `<h1>`. Loading shows a `role="status"` line; a failed chunk
  shows a `role="alert"` with a recovery instruction.
- **SceneBlock** (`SceneBlock.tsx`): `<section aria-labelledby>` with an `<h2>` "Scene k of n"
  (plus the author's scene dateline when present), an optional italic aside from the
  previous beat, the story HTML in `.scene-body`, and an optional `<details class="recap">`.
- **Story HTML** (`story.css`): paragraphs, emphasis, blockquotes, lists, tables, `<pre>`,
  SVG illustrations, `.device-view` panels (`.narrow-device-view` 22rem, `.device-view-left`
  start-aligned, tables, `.dv-button` and `.dv-range` decorative controls), `.dz-card`
  letters, and the single `blinker` keyframe.
- **NightsMenu** (`NightsMenu.tsx`): `<ol class="nights-grid">` of `.night-card` links with
  `.is-current` (accent inset ring, "Reading") and `.is-done` ("Finished") states and
  `aria-current`.
- **NightEnd / Finale** (`NightEnd.tsx`, `Finale.tsx`): centered screens with the display
  number, dateline, `.stats`, a `.card` recap, and primary + secondary actions.
- **TitleScreen** (`TitleScreen.tsx`): `Moon`, display title, Begin/Continue + All nights,
  About and a native `confirm()`-guarded "Start over".
- **Settings** (`Settings.tsx`): `SettingsFields` (radio segments for text size using
  `label:has(input:checked)`, a native checkbox for snow) inside a `<details class="settings">`
  popover in the bar and inline on the About page.
- **Snowfall** (`Snowfall.tsx`): decorative canvas, `aria-hidden`, pauses when hidden,
  unmounted under reduced motion unless the user opts back in.
- **Moon / MoonPhase** (`Moon.tsx`): decorative SVGs; `MoonPhase` fills with the fraction
  of scenes read.
- **Skip link** (`.skip-link`): first focusable element, targets `#main`.

## Do's and don'ts

- Start a new screen from `.screen` (or `.screen-center` / `.screen-wide`), give it one
  `<h1 tabIndex={-1}>` that you focus on mount, and add a `Route` case in `lib/router.ts`.
- Use exactly one `.btn-primary` per view; everything else is `.btn` or `.btn-ghost`.
  Button labels are verb-first sentence case ("Continue", "Finish Night 3", "Read again from
  Night 1"); the flow vocabulary is Begin → Continue → Finish.
- Reference only semantic tokens; add a token if a role is missing rather than reusing a
  border colour as text.
- Keep motion inside `@media (prefers-reduced-motion: no-preference)` and transition named
  properties only (`transition-property: background-color, border-color, color, scale`).
- Story markup changes belong in `scripts/extract-chapters.mjs`, never in the JSON or the
  components; rerun `npm run extract` and the content test will confirm the text is intact.
- Do not add a light theme, a second accent, wallet code, or anything that phones home.
