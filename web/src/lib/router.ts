import { useMemo, useSyncExternalStore } from 'react';

export const CHAPTER_COUNT = 32;

export type Route =
  | { kind: 'title' }
  | { kind: 'nights' }
  | { kind: 'about' }
  | { kind: 'end' }
  | { kind: 'night'; n: number; revealed: number }
  | { kind: 'done'; n: number };

/** Parse a location hash such as `#/night/3/2` into a route. Unknown paths fall back to the title screen. */
export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#/, '')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { kind: 'title' };
  switch (parts[0]) {
    case 'nights':
      return { kind: 'nights' };
    case 'about':
      return { kind: 'about' };
    case 'end':
      return { kind: 'end' };
    case 'night': {
      const n = Number(parts[1]);
      if (!Number.isInteger(n) || n < 1 || n > CHAPTER_COUNT) return { kind: 'title' };
      if (parts[2] === 'done') return { kind: 'done', n };
      const revealed = parts[2] === undefined ? 1 : Number(parts[2]);
      if (!Number.isInteger(revealed) || revealed < 1) return { kind: 'night', n, revealed: 1 };
      return { kind: 'night', n, revealed };
    }
    default:
      return { kind: 'title' };
  }
}

export function hashFor(route: Route): string {
  switch (route.kind) {
    case 'title':
      return '#/';
    case 'nights':
      return '#/nights';
    case 'about':
      return '#/about';
    case 'end':
      return '#/end';
    case 'done':
      return `#/night/${route.n}/done`;
    case 'night':
      return route.revealed > 1 ? `#/night/${route.n}/${route.revealed}` : `#/night/${route.n}`;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}
const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseHash(hash), [hash]);
}

export function navigate(route: Route, opts: { replace?: boolean } = {}) {
  const hash = hashFor(route);
  if (opts.replace) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
