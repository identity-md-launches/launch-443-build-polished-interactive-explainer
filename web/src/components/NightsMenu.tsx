import { useEffect, useRef } from 'react';
import { CHAPTERS, formatDateline } from '../lib/content';
import { hashFor } from '../lib/router';
import { useProgress } from '../lib/progress';

export function NightsMenu() {
  const progress = useProgress();
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h1.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  const current = progress.furthest?.chapter ?? null;

  return (
    <section className="screen screen-wide" aria-labelledby="nights-heading">
      <div className="topbar">
        <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'title' })}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Title
        </a>
        <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'about' })}>
          About
        </a>
      </div>
      <h1 id="nights-heading" ref={h1} tabIndex={-1}>
        Thirty-two nights
      </h1>
      <p className="lede" style={{ marginBlockStart: 'var(--space-3)' }}>
        The story runs in order. Pick a night to open it; finished nights and your current night are marked.
      </p>
      <ol className="nights-grid">
        {CHAPTERS.map((c) => {
          const done = progress.completed.includes(c.number);
          const isCurrent = current === c.number && !done;
          const scene = isCurrent ? progress.furthest!.scene : 1;
          const state = done ? 'Finished' : isCurrent ? 'Reading' : '';
          const cls = ['night-card', done && 'is-done', isCurrent && 'is-current'].filter(Boolean).join(' ');
          return (
            <li key={c.number}>
              <a className={cls} href={hashFor({ kind: 'night', n: c.number, revealed: scene })} aria-current={isCurrent ? 'true' : undefined}>
                <span className="night-card-top">
                  <span className="night-card-num">
                    <span className="visually-hidden">Night </span>
                    <span className="num">{c.number}</span>
                  </span>
                  {state && <span className="night-card-state">{state}</span>}
                </span>
                <span className="night-card-place">{c.place}</span>
                <span className="night-card-date">{formatDateline(null, c.date)}</span>
                <span className="night-card-state">
                  <span className="num">{c.scenes.length}</span> {c.scenes.length === 1 ? 'scene' : 'scenes'} · <span className="num">{Math.round(c.words / 100) / 10}</span>k words
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
