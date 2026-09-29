import { useEffect, useRef } from 'react';
import { Moon } from './Moon';
import { CHAPTERS, SOURCE_URL, TOTAL_WORDS, chapterMeta } from '../lib/content';
import { hashFor } from '../lib/router';
import { resetProgress, useProgress } from '../lib/progress';

export function TitleScreen() {
  const progress = useProgress();
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h1.current?.focus({ preventScroll: true });
  }, []);

  const furthest = progress.furthest;
  const resume = furthest ? chapterMeta(furthest.chapter) : null;
  const finished = progress.completed.length === CHAPTERS.length;

  const onReset = () => {
    if (window.confirm('Forget your reading position and choices? Display settings are kept.')) {
      resetProgress();
    }
  };

  return (
    <section className="screen screen-center" aria-labelledby="title-heading">
      <Moon className="title-moon enter" />
      <h1 id="title-heading" ref={h1} tabIndex={-1} className="title-name enter enter-2">
        Snowmoon
      </h1>
      <p className="title-by enter enter-2">a story by Vitalik Buterin</p>
      <p className="title-meta eyebrow enter enter-3">
        32 nights · about <span className="num">{Math.round(TOTAL_WORDS / 1000)}</span>,000 words
      </p>

      <div className="actions title-actions enter enter-3">
        {resume && !finished ? (
          <>
            <a className="btn btn-primary btn-lg" href={hashFor({ kind: 'night', n: resume.number, revealed: furthest!.scene })}>
              Continue Night {resume.number}
            </a>
            <a className="btn btn-lg" href={hashFor({ kind: 'nights' })}>
              All nights
            </a>
          </>
        ) : (
          <>
            <a className="btn btn-primary btn-lg" href={hashFor({ kind: 'night', n: 1, revealed: 1 })}>
              {finished ? 'Read again from Night 1' : 'Begin Night 1'}
            </a>
            <a className="btn btn-lg" href={hashFor({ kind: 'nights' })}>
              All nights
            </a>
          </>
        )}
      </div>
      <div className="actions enter enter-3" style={{ marginBlockStart: 'var(--space-4)' }}>
        <a className="btn btn-ghost" href={hashFor({ kind: 'about' })}>
          About this reader
        </a>
        {resume && (
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Start over
          </button>
        )}
      </div>

      <p className="title-foot">
        Read night by night, one scene at a time. Your place is remembered on this device only.
        <br />
        Text © Vitalik Buterin, <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL v3</a>. Source:{' '}
        <a href={SOURCE_URL}>vbuterin/blog on GitHub</a>.
      </p>
    </section>
  );
}
