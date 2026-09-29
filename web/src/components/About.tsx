import { useEffect, useRef } from 'react';
import { hashFor } from '../lib/router';
import { SOURCE_COMMIT, SOURCE_URL } from '../lib/content';
import { SettingsFields } from './Settings';
import { Declarations } from './Declarations';

const REPO_URL = 'https://github.com/Identity-md';

export function About() {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    h1.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="screen" aria-labelledby="about-heading">
      <div className="topbar">
        <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'title' })}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Title
        </a>
        <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'nights' })}>
          All nights
        </a>
      </div>
      <div className="prose">
        <h1 id="about-heading" ref={h1} tabIndex={-1}>
          About this reader
        </h1>
        <p className="lede">
          Snowmoon is a short story in 32 chapters by Vitalik Buterin. This site presents it as thirty-two nights, one scene at a
          time, with the author's text untouched.
        </p>

        <h2>Display</h2>
        <div className="card" style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <SettingsFields />
        </div>

        <h2>How to read</h2>
        <ul>
          <li>Press Continue at the end of each scene. Finished scenes stay on the page so you can scroll back.</li>
          <li>
            Some scenes end with a small choice about where your attention goes. Either answer leads to the same next scene; the
            story never forks.
          </li>
          <li>Under scenes that lean on invented mechanisms, "What just happened" offers a short plain summary. The text is always shown in full.</li>
          <li>Your place and choices are stored in this browser only. There is no account, no server and no analytics.</li>
        </ul>

        <h2>Source and license</h2>
        <p>
          The text is taken verbatim from{' '}
          <a href={SOURCE_URL}>
            <code>site/snowmoon</code> in vbuterin/blog
          </a>{' '}
          at commit <code>{SOURCE_COMMIT.slice(0, 12)}</code>. Chapter pages are split at the author's own scene breaks; nothing
          was rewritten, summarised in place, or reordered.
        </p>
        <p>
          Snowmoon is published under the GNU General Public License v3, and so is this reader. Its complete source, the
          extraction script that turns the upstream pages into chapter data, and the prompts and notes used to build it are
          published on <a href={REPO_URL}>GitHub</a> so that others can rebuild or remix it.
        </p>
        <Declarations />
      </div>
    </section>
  );
}
