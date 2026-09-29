#!/usr/bin/env node
/**
 * extract-chapters.mjs
 *
 * Turns the upstream Snowmoon chapter pages (source/upstream/html/chapter-N.html,
 * pinned to commit 5c6b6d0808ef271d09bb1182ab8697542ee7058d of vbuterin/blog)
 * into the JSON the reader loads one chapter at a time:
 *
 *   src/content/chapters/chapter-NN.json   one file per chapter, scenes with HTML
 *   src/content/index.json                 light metadata for menus and progress
 *
 * The prose is kept verbatim. The only edits are structural:
 *   - the per-page chrome (dark-mode toggle, prev/next nav, <h1>, script) is dropped
 *   - the chapter is split into scenes at the author's own scene breaks
 *     (<hr> and <div class="dateline scene-break">)
 *   - decorative controls drawn inside fictional device screens (<button>,
 *     <input type="range">) become non-interactive spans so keyboard and
 *     screen-reader users are not offered dead controls
 *   - inline event handlers and <script> are removed as a safety net
 *
 * Usage:  node scripts/extract-chapters.mjs            (reads source/upstream/html)
 *         node scripts/extract-chapters.mjs --fetch    (re-downloads the pinned files first)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const upstreamDir = join(root, 'source', 'upstream', 'html');
const outDir = join(root, 'src', 'content', 'chapters');
const indexOut = join(root, 'src', 'content', 'index.json');

const COMMIT = '5c6b6d0808ef271d09bb1182ab8697542ee7058d';
const RAW = `https://raw.githubusercontent.com/vbuterin/blog/${COMMIT}/site/snowmoon`;
const CHAPTERS = 32;

const fetchFirst = process.argv.includes('--fetch');

async function fetchUpstream() {
  await mkdir(upstreamDir, { recursive: true });
  const files = ['wordcounts.tsv', ...Array.from({ length: CHAPTERS }, (_, i) => `chapter-${i + 1}.html`)];
  for (const f of files) {
    const res = await fetch(`${RAW}/html/${f}`);
    if (!res.ok) throw new Error(`fetch ${f}: ${res.status}`);
    await writeFile(join(upstreamDir, f), await res.text());
  }
  const idx = await fetch(`${RAW}/index.html`);
  if (!idx.ok) throw new Error(`fetch index.html: ${idx.status}`);
  await writeFile(join(root, 'source', 'upstream', 'index.html'), await idx.text());
}

function countWords(text) {
  return text
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Remove scripts and inline handlers, neutralise decorative controls. */
function sanitize(rootEl) {
  for (const s of rootEl.querySelectorAll('script')) s.remove();
  for (const el of rootEl.querySelectorAll('*')) {
    for (const name of Object.keys(el.attributes)) {
      if (/^on/i.test(name)) el.removeAttribute(name);
      if (name === 'href' && /^\s*javascript:/i.test(el.getAttribute(name) ?? '')) el.removeAttribute(name);
    }
  }
  // Fictional UI drawn inside the story: keep the look, drop the dead interactivity.
  for (const b of rootEl.querySelectorAll('button')) {
    const attrs = b.getAttribute('style') ? ` style="${b.getAttribute('style')}"` : '';
    b.replaceWith(`<span class="dv-button" aria-hidden="true"${attrs}>${b.innerHTML}</span>`);
  }
  for (const i of rootEl.querySelectorAll('input')) {
    i.replaceWith('<span class="dv-range" role="img" aria-label="Slider set near the middle"><span class="dv-range-thumb"></span></span>');
  }
  // One blinking terminal prompt uses a dark blue (#22b) that is unreadable on the
  // reader's night background; keep the blink, move the color to the device ink token.
  for (const el of rootEl.querySelectorAll('[style*="#22b"]')) {
    el.setAttribute('style', el.getAttribute('style').replace(/color:\s*#22b/, 'color: var(--color-device-ink)'));
  }
  return rootEl;
}

/**
 * Several chapters reuse the same SVG ids (glow, arrowhead, ttl, ...). Since the
 * reader shows every scene of a chapter on one page, prefix each SVG's ids and the
 * references to them so gradients, markers, clip paths and labels keep resolving.
 */
function uniquifySvgIds(sceneHtml, prefix) {
  let k = 0;
  return sceneHtml.replace(/<svg[\s\S]*?<\/svg>/g, (svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    if (!ids.length) return svg;
    const p = `${prefix}${k++}-`;
    let out = svg;
    for (const id of ids) {
      const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out
        .replace(new RegExp(`\\sid="${esc}"`, 'g'), ` id="${p}${id}"`)
        .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${p}${id})`)
        .replace(new RegExp(`(href)="#${esc}"`, 'g'), `$1="#${p}${id}"`);
    }
    // aria-labelledby / aria-describedby carry space-separated id lists
    out = out.replace(/(aria-(?:labelledby|describedby))="([^"]+)"/g, (_, attr, list) => {
      const mapped = list
        .split(/\s+/)
        .map((id) => (ids.includes(id) ? `${p}${id}` : id))
        .join(' ');
      return `${attr}="${mapped}"`;
    });
    return out;
  });
}

function datelineParts(el) {
  const place = el.querySelector('.place')?.text.trim() ?? null;
  const date = el.querySelector('.date')?.text.trim() ?? null;
  if (!place && !date) {
    // A bare scene-break dateline carries only text (a date without the .date class).
    const txt = el.querySelector('.txt')?.text.trim();
    return { place: null, date: txt || null };
  }
  return { place, date };
}

async function extractChapter(n) {
  const html = await readFile(join(upstreamDir, `chapter-${n}.html`), 'utf8');
  const doc = parse(html, { comment: false });
  const page = doc.querySelector('.document-page');
  if (!page) throw new Error(`chapter ${n}: .document-page not found`);

  for (const nav of page.querySelectorAll('nav.chapter-nav')) nav.remove();
  const h1 = page.querySelector('h1');
  const title = h1?.text.trim() ?? `Chapter ${n}`;
  h1?.remove();

  const open = page.querySelector('.dateline.chapter-open');
  const { place, date } = open ? datelineParts(open) : { place: null, date: null };
  open?.remove();

  sanitize(page);

  const scenes = [];
  let current = { place: null, date: null, parts: [] };
  const push = () => {
    if (current.parts.length) scenes.push(current);
  };
  for (const node of page.childNodes) {
    if (node.nodeType === 3) {
      if (node.text.trim()) current.parts.push(node.text);
      continue;
    }
    if (node.nodeType !== 1) continue;
    const tag = node.rawTagName?.toLowerCase();
    if (tag === 'hr') {
      push();
      current = { place: null, date: null, parts: [] };
      continue;
    }
    if (tag === 'div' && node.classList.contains('dateline') && node.classList.contains('scene-break')) {
      push();
      current = { ...datelineParts(node), parts: [] };
      continue;
    }
    current.parts.push(node.outerHTML);
  }
  push();

  const out = {
    number: n,
    title,
    place,
    date,
    scenes: scenes.map((s, i) => {
      const sceneHtml = uniquifySvgIds(s.parts.join('\n').trim(), `c${n}s${i + 1}-`);
      const text = parse(sceneHtml).text;
      return {
        id: `${n}-${i + 1}`,
        place: s.place,
        date: s.date,
        words: countWords(text),
        html: sceneHtml,
      };
    }),
  };
  out.words = out.scenes.reduce((a, s) => a + s.words, 0);

  const leftoverLinks = out.scenes.flatMap((s) => [...s.html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]));
  if (leftoverLinks.length) console.warn(`chapter ${n}: anchors kept in prose:`, leftoverLinks);
  if (/<script|\son[a-z]+=/i.test(out.scenes.map((s) => s.html).join(''))) {
    throw new Error(`chapter ${n}: unsafe markup survived sanitising`);
  }
  return out;
}

async function main() {
  if (fetchFirst) await fetchUpstream();
  await mkdir(outDir, { recursive: true });

  let upstreamCounts = {};
  try {
    const tsv = await readFile(join(upstreamDir, 'wordcounts.tsv'), 'utf8');
    for (const line of tsv.split('\n')) {
      const [k, v] = line.trim().split('\t');
      if (k && v) upstreamCounts[k] = Number(v);
    }
  } catch {
    /* optional */
  }

  const index = [];
  for (let n = 1; n <= CHAPTERS; n++) {
    const ch = await extractChapter(n);
    const file = `chapter-${String(n).padStart(2, '0')}.json`;
    await writeFile(join(outDir, file), JSON.stringify(ch));
    index.push({
      number: n,
      title: ch.title,
      place: ch.place,
      date: ch.date,
      words: ch.words,
      file,
      scenes: ch.scenes.map(({ id, place, date, words }) => ({ id, place, date, words })),
    });
    const ref = upstreamCounts[`ch${n}`];
    const delta = ref ? ` (upstream ${ref}, diff ${ch.words - ref})` : '';
    console.log(`${file}: ${ch.scenes.length} scenes, ${ch.words} words${delta}`);
  }
  await writeFile(
    indexOut,
    JSON.stringify(
      {
        source: `https://github.com/vbuterin/blog/tree/${COMMIT}/site/snowmoon`,
        commit: COMMIT,
        license: 'GPL-3.0',
        totalWords: index.reduce((a, c) => a + c.words, 0),
        chapters: index,
      },
      null,
      1,
    ),
  );
  console.log(`index.json: ${index.length} chapters, ${index.reduce((a, c) => a + c.words, 0)} words`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
