import { useEffect, useRef } from 'react';
import { CHAPTER_COUNT, hashFor } from '../lib/router';
import { chapterMeta, formatDateline, loadChapter, storyFraction } from '../lib/content';
import { chapterRecapFor } from '../content/recaps';

export function NightEnd({ n }: { n: number }) {
  const meta = chapterMeta(n);
  const next = n < CHAPTER_COUNT ? chapterMeta(n + 1) : null;
  const h1 = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    h1.current?.focus({ preventScroll: true });
    if (next) void loadChapter(next.number).catch(() => {});
  }, [n, next]);

  const percent = Math.round(storyFraction(n, meta.scenes.length) * 100);
  const recap = chapterRecapFor(n);

  return (
    <section className="screen screen-center" aria-labelledby="night-end-heading">
      <p className="eyebrow enter">Night complete</p>
      <h1 id="night-end-heading" ref={h1} tabIndex={-1} className="night-end-title enter enter-2">
        Night <span className="num">{n}</span>
      </h1>
      <p className="night-end-sub enter enter-2">{formatDateline(meta.place, meta.date)}</p>
      <p className="stats enter enter-3" style={{ marginBlockStart: 'var(--space-4)' }}>
        <span>
          <span className="num">{meta.scenes.length}</span> {meta.scenes.length === 1 ? 'scene' : 'scenes'}
        </span>
        <span>
          <span className="num">{meta.words.toLocaleString('en-US')}</span> words
        </span>
        <span>
          <span className="num">{percent}</span>% of the story
        </span>
      </p>

      {recap && (
        <div className="card enter enter-3" style={{ marginBlockStart: 'var(--space-6)' }}>
          <p className="eyebrow" style={{ marginBlockEnd: 'var(--space-2)' }}>
            What happened tonight
          </p>
          <p style={{ color: 'var(--color-text-secondary)', textWrap: 'pretty' }}>{recap}</p>
        </div>
      )}

      <div className="actions enter enter-3" style={{ marginBlockStart: 'var(--space-6)' }}>
        {next ? (
          <a className="btn btn-primary btn-lg" href={hashFor({ kind: 'night', n: next.number, revealed: 1 })}>
            Continue to Night {next.number}
          </a>
        ) : (
          <a className="btn btn-primary btn-lg" href={hashFor({ kind: 'end' })}>
            See the ending
          </a>
        )}
        <a className="btn btn-lg" href={hashFor({ kind: 'nights' })}>
          All nights
        </a>
      </div>
      {next && (
        <p className="muted enter enter-3" style={{ marginBlockStart: 'var(--space-5)', fontStyle: 'italic' }}>
          Next: {formatDateline(next.place, next.date)}
        </p>
      )}
    </section>
  );
}
