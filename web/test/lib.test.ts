import { hashFor, parseHash } from '../src/lib/router';
import { storyFraction, wordsRead, CHAPTERS, TOTAL_WORDS } from '../src/lib/content';
import { stripMotion } from '../src/lib/motion';
import { getProgress, markCompleted, recordChoice, recordReached, resetProgress, setTextSize } from '../src/lib/progress';

describe('hash router', () => {
  it('parses and prints every route', () => {
    expect(parseHash('')).toEqual({ kind: 'title' });
    expect(parseHash('#/')).toEqual({ kind: 'title' });
    expect(parseHash('#/nights')).toEqual({ kind: 'nights' });
    expect(parseHash('#/about')).toEqual({ kind: 'about' });
    expect(parseHash('#/end')).toEqual({ kind: 'end' });
    expect(parseHash('#/night/3')).toEqual({ kind: 'night', n: 3, revealed: 1 });
    expect(parseHash('#/night/3/4')).toEqual({ kind: 'night', n: 3, revealed: 4 });
    expect(parseHash('#/night/3/done')).toEqual({ kind: 'done', n: 3 });
    expect(parseHash('#/night/0')).toEqual({ kind: 'title' });
    expect(parseHash('#/night/33')).toEqual({ kind: 'title' });
    expect(parseHash('#/night/2/zero')).toEqual({ kind: 'night', n: 2, revealed: 1 });
    expect(parseHash('#/garbage/1')).toEqual({ kind: 'title' });
  });
  it('round-trips', () => {
    for (const h of ['#/', '#/nights', '#/about', '#/end', '#/night/7', '#/night/7/3', '#/night/32/done']) {
      expect(hashFor(parseHash(h))).toBe(h);
    }
  });
});

describe('story progress math', () => {
  it('counts words read monotonically', () => {
    expect(wordsRead(1, 0)).toBe(0);
    expect(wordsRead(1, 1)).toBe(CHAPTERS[0].scenes[0].words);
    expect(wordsRead(2, 0)).toBe(CHAPTERS[0].words);
    expect(wordsRead(32, 99)).toBe(TOTAL_WORDS);
    expect(storyFraction(32, 99)).toBe(1);
    let last = -1;
    for (const c of CHAPTERS) {
      for (let s = 1; s <= c.scenes.length; s++) {
        const w = wordsRead(c.number, s);
        expect(w).toBeGreaterThan(last);
        last = w;
      }
    }
  });
});

describe('reduced-motion stripping', () => {
  it('removes SMIL animation and inline animation declarations only', () => {
    const html =
      '<svg><circle r="1"><animate attributeName="opacity" values="0;1" dur="1s" repeatCount="indefinite"/></circle>' +
      '<animateTransform attributeName="transform" type="rotate"></animateTransform></svg>' +
      '<b style="color: red; animation: blinker 1s linear infinite"> &gt; </b>';
    const out = stripMotion(html);
    expect(out).not.toMatch(/<animate/);
    expect(out).not.toMatch(/animation\s*:/);
    expect(out).toContain('<circle r="1"></circle>');
    expect(out).toContain('color: red;');
  });
});

describe('progress store', () => {
  beforeEach(() => resetProgress());
  it('only moves the furthest marker forward', () => {
    recordReached(3, 2);
    recordReached(2, 5);
    expect(getProgress().furthest).toEqual({ chapter: 3, scene: 2 });
    recordReached(3, 1);
    expect(getProgress().furthest).toEqual({ chapter: 3, scene: 2 });
    recordReached(3, 3);
    expect(getProgress().furthest).toEqual({ chapter: 3, scene: 3 });
  });
  it('records completion, choices and prefs, and reset keeps prefs', () => {
    markCompleted(2);
    markCompleted(1);
    markCompleted(2);
    recordChoice('n1-drone', 1);
    setTextSize('l');
    expect(getProgress().completed).toEqual([1, 2]);
    expect(getProgress().choices).toEqual({ 'n1-drone': 1 });
    expect(JSON.parse(localStorage.getItem('snowmoon-flow.progress.v1')!).prefs.textSize).toBe('l');
    resetProgress();
    expect(getProgress().completed).toEqual([]);
    expect(getProgress().furthest).toBeNull();
    expect(getProgress().prefs.textSize).toBe('l');
  });
});
