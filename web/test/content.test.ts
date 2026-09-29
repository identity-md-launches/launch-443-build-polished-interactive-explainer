import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import index from '../src/content/index.json';
import { BEATS } from '../src/content/beats';
import { CHAPTER_RECAPS, SCENE_RECAPS } from '../src/content/recaps';

const root = join(__dirname, '..');
const chapterFile = (n: number) => join(root, 'src', 'content', 'chapters', `chapter-${String(n).padStart(2, '0')}.json`);
const upstreamFile = (n: number) => join(root, 'source', 'upstream', 'html', `chapter-${n}.html`);

interface Scene {
  id: string;
  place: string | null;
  date: string | null;
  words: number;
  html: string;
}
interface Chapter {
  number: number;
  title: string;
  place: string | null;
  date: string | null;
  words: number;
  scenes: Scene[];
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('extracted chapters', () => {
  const chapters: Chapter[] = Array.from({ length: 32 }, (_, i) => JSON.parse(readFileSync(chapterFile(i + 1), 'utf8')));

  it('index lists all 32 chapters in order and matches the chapter files', () => {
    expect(index.chapters).toHaveLength(32);
    index.chapters.forEach((c, i) => {
      expect(c.number).toBe(i + 1);
      expect(c.title).toBe(`Chapter ${i + 1}`);
      expect(c.file).toBe(`chapter-${String(i + 1).padStart(2, '0')}.json`);
      expect(c.scenes.length).toBe(chapters[i].scenes.length);
      expect(c.words).toBe(chapters[i].words);
      expect(c.place).toBeTruthy();
      expect(c.date).toBeTruthy();
    });
    expect(index.totalWords).toBe(chapters.reduce((a, c) => a + c.words, 0));
    expect(index.totalWords).toBeGreaterThan(95_000);
  });

  it('every chapter has scenes with text and no executable markup', () => {
    for (const ch of chapters) {
      expect(ch.scenes.length).toBeGreaterThan(0);
      for (const s of ch.scenes) {
        expect(s.html.length).toBeGreaterThan(50);
        expect(s.words).toBeGreaterThan(0);
        expect(s.html).not.toMatch(/<script/i);
        expect(s.html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(s.html).not.toMatch(/javascript:/i);
        expect(s.html).not.toMatch(/<(button|input)\b/i);
      }
    }
  });

  it('keeps the author’s text verbatim (chapter text equals the upstream page text)', () => {
    for (const ch of chapters) {
      const doc = parse(readFileSync(upstreamFile(ch.number), 'utf8'));
      const page = doc.querySelector('.document-page')!;
      for (const el of page.querySelectorAll('nav.chapter-nav, h1, .dateline, script')) el.remove();
      const expected = norm(page.text);
      const actual = norm(ch.scenes.map((s) => parse(s.html).text).join(' '));
      expect(actual).toBe(expected);
    }
  });

  it('starts where the story starts', () => {
    expect(parse(chapters[0].scenes[0].html).text).toMatch(/^Gladias was walking along a foot path/);
    expect(chapters[0].place).toBe('Meldan, Veridia');
    expect(chapters[0].date).toBe('3724 Snowmoon 3');
  });

  it('gives every SVG id a chapter-scene prefix so ids never collide on one page', () => {
    for (const ch of chapters) {
      const ids = ch.scenes.flatMap((s) => [...s.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('recaps and beats point at scenes that exist', () => {
    const sceneIds = new Set(chapters.flatMap((c) => c.scenes.map((s) => s.id)));
    for (const id of Object.keys(SCENE_RECAPS)) expect(sceneIds.has(id)).toBe(true);
    for (const n of Object.keys(CHAPTER_RECAPS)) expect(Number(n)).toBeGreaterThanOrEqual(1);
    for (const b of BEATS) {
      const ch = chapters[b.chapter - 1];
      expect(b.afterScene).toBeGreaterThanOrEqual(1);
      expect(b.afterScene).toBeLessThan(ch.scenes.length); // there must be a next scene
      expect(b.options).toHaveLength(2);
    }
    expect(new Set(BEATS.map((b) => b.id)).size).toBe(BEATS.length);
  });
});
