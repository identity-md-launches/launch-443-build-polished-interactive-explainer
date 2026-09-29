import { useEffect, useRef } from 'react';
import { Moon } from './Moon';
import { hashFor } from '../lib/router';
import { SOURCE_URL } from '../lib/content';
import { Declarations } from './Declarations';

export function Finale() {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    h1.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="screen screen-center" aria-labelledby="end-heading">
      <Moon className="title-moon enter" />
      <p className="eyebrow enter">Thirty-two nights</p>
      <h1 id="end-heading" ref={h1} tabIndex={-1} className="night-end-title enter enter-2">
        The end
      </h1>
      <p className="lede enter enter-2" style={{ marginBlockStart: 'var(--space-4)' }}>
        You have read all of Snowmoon.
      </p>

      <div className="card enter enter-3" style={{ marginBlockStart: 'var(--space-6)' }}>
        <p className="eyebrow" style={{ marginBlockEnd: 'var(--space-3)' }}>
          From the author
        </p>
        <Declarations />
      </div>

      <div className="actions enter enter-3" style={{ marginBlockStart: 'var(--space-6)' }}>
        <a className="btn btn-primary btn-lg" href={hashFor({ kind: 'night', n: 1, revealed: 1 })}>
          Read again from Night 1
        </a>
        <a className="btn btn-lg" href={hashFor({ kind: 'nights' })}>
          All nights
        </a>
      </div>
      <p className="title-foot">
        The original pages live at <a href={SOURCE_URL}>vbuterin/blog on GitHub</a>. <a href={hashFor({ kind: 'about' })}>About this reader</a>.
      </p>
    </section>
  );
}
