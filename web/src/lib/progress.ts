import { useSyncExternalStore } from 'react';
import { CHAPTER_COUNT } from './router';

export type TextSize = 's' | 'm' | 'l';
export type SnowPref = 'auto' | 'on' | 'off';

export interface Progress {
  version: 1;
  /** The furthest scene the reader has reached, used for "Continue". */
  furthest: { chapter: number; scene: number } | null;
  /** Chapter numbers whose final scene has been finished. */
  completed: number[];
  /** Flavor-choice selections by beat id. */
  choices: Record<string, number>;
  prefs: { textSize: TextSize; snow: SnowPref };
}

const KEY = 'snowmoon-flow.progress.v1';

const DEFAULT: Progress = {
  version: 1,
  furthest: null,
  completed: [],
  choices: {},
  prefs: { textSize: 'm', snow: 'auto' },
};

function isTextSize(v: unknown): v is TextSize {
  return v === 's' || v === 'm' || v === 'l';
}
function isSnowPref(v: unknown): v is SnowPref {
  return v === 'auto' || v === 'on' || v === 'off';
}

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw) as Partial<Progress>;
    const furthest =
      p.furthest && Number.isInteger(p.furthest.chapter) && Number.isInteger(p.furthest.scene)
        ? { chapter: Math.min(CHAPTER_COUNT, Math.max(1, p.furthest.chapter)), scene: Math.max(1, p.furthest.scene) }
        : null;
    return {
      version: 1,
      furthest,
      completed: Array.isArray(p.completed) ? p.completed.filter((n) => Number.isInteger(n)) : [],
      choices: p.choices && typeof p.choices === 'object' ? p.choices : {},
      prefs: {
        textSize: isTextSize(p.prefs?.textSize) ? p.prefs.textSize : 'm',
        snow: isSnowPref(p.prefs?.snow) ? p.prefs.snow : 'auto',
      },
    };
  } catch {
    return DEFAULT;
  }
}

let state: Progress = typeof window === 'undefined' ? DEFAULT : load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota: keep in memory only */
  }
  listeners.forEach((l) => l());
}

export function getProgress(): Progress {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

/** Advance the furthest-reached marker; never moves it backwards. */
export function recordReached(chapter: number, scene: number) {
  const f = state.furthest;
  if (f && (f.chapter > chapter || (f.chapter === chapter && f.scene >= scene))) return;
  commit({ ...state, furthest: { chapter, scene } });
}

export function markCompleted(chapter: number) {
  if (state.completed.includes(chapter)) return;
  commit({ ...state, completed: [...state.completed, chapter].sort((a, b) => a - b) });
}

export function recordChoice(beatId: string, option: number) {
  if (state.choices[beatId] === option) return;
  commit({ ...state, choices: { ...state.choices, [beatId]: option } });
}

export function setTextSize(textSize: TextSize) {
  commit({ ...state, prefs: { ...state.prefs, textSize } });
}

export function setSnowPref(snow: SnowPref) {
  commit({ ...state, prefs: { ...state.prefs, snow } });
}

/** Forget reading position and choices, keep display preferences. */
export function resetProgress() {
  commit({ ...DEFAULT, prefs: state.prefs });
}
