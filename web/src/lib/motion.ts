import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
function getSnapshot() {
  return typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * The story's own illustrations contain SMIL <animate> elements (blinking lights on a
 * map, a pulsing cursor). CSS cannot switch SMIL off, so under reduced motion the
 * animation elements and inline `animation:` declarations are removed before render.
 */
export function stripMotion(html: string): string {
  return html
    .replace(/<animate(?:Transform|Motion)?\b[^>]*?\/>/g, '')
    .replace(/<animate(?:Transform|Motion)?\b[^>]*>[\s\S]*?<\/animate(?:Transform|Motion)?>/g, '')
    .replace(/animation\s*:[^;"']*;?/g, '');
}
