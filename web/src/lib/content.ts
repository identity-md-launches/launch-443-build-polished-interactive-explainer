import index from '../content/index.json';

export interface SceneMeta {
  id: string;
  place: string | null;
  date: string | null;
  words: number;
}
export interface ChapterMeta {
  number: number;
  title: string;
  place: string | null;
  date: string | null;
  words: number;
  file: string;
  scenes: SceneMeta[];
}
export interface Scene extends SceneMeta {
  html: string;
}
export interface Chapter {
  number: number;
  title: string;
  place: string | null;
  date: string | null;
  words: number;
  scenes: Scene[];
}

export const CHAPTERS: ChapterMeta[] = index.chapters as ChapterMeta[];
export const TOTAL_WORDS: number = index.totalWords;
export const SOURCE_URL: string = index.source;
export const SOURCE_COMMIT: string = index.commit;

export function chapterMeta(n: number): ChapterMeta {
  const meta = CHAPTERS[n - 1];
  if (!meta) throw new Error(`No chapter ${n}`);
  return meta;
}

/** Words in all chapters before `n` plus the first `revealed` scenes of chapter `n`. */
export function wordsRead(n: number, revealed: number): number {
  let sum = 0;
  for (let i = 0; i < n - 1; i++) sum += CHAPTERS[i].words;
  const scenes = chapterMeta(n).scenes;
  for (let i = 0; i < Math.min(revealed, scenes.length); i++) sum += scenes[i].words;
  return sum;
}

export function storyFraction(n: number, revealed: number): number {
  return Math.min(1, wordsRead(n, revealed) / TOTAL_WORDS);
}

// One small chunk per chapter, fetched with a relative URL when the reader gets there.
const loaders = import.meta.glob<{ default: Chapter }>('../content/chapters/*.json');
const cache = new Map<number, Promise<Chapter>>();

export function loadChapter(n: number): Promise<Chapter> {
  const meta = chapterMeta(n);
  let p = cache.get(n);
  if (!p) {
    const loader = loaders[`../content/chapters/${meta.file}`];
    if (!loader) return Promise.reject(new Error(`Chapter file ${meta.file} is not bundled`));
    p = loader().then((m) => m.default);
    p.catch(() => cache.delete(n));
    cache.set(n, p);
  }
  return p;
}

export function formatDateline(place: string | null, date: string | null, sep = ' · '): string {
  return [place, date].filter(Boolean).join(sep);
}
