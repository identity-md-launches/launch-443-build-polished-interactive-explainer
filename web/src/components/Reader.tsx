import { useEffect, useRef, useState } from 'react';
import { CHAPTER_COUNT, hashFor, navigate } from '../lib/router';
import { chapterMeta, formatDateline, loadChapter, storyFraction, type Chapter } from '../lib/content';
import { markCompleted, recordChoice, recordReached, useProgress } from '../lib/progress';
import { usePrefersReducedMotion } from '../lib/motion';
import { chapterRecapFor, sceneRecapFor } from '../content/recaps';
import { beatAfter, beatBefore } from '../content/beats';
import { SceneBlock } from './SceneBlock';
import { MoonPhase } from './Moon';
import { SettingsPopover } from './Settings';

interface Props {
  n: number;
  revealed: number;
}

export function Reader({ n, revealed }: Props) {
  const meta = chapterMeta(n);
  const total = meta.scenes.length;
  const shown = Math.min(revealed, total);
  const progress = useProgress();
  const reduce = usePrefersReducedMotion();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the chapter chunk when the night changes.
  useEffect(() => {
    let alive = true;
    setChapter(null);
    setError(null);
    loadChapter(n)
      .then((c) => alive && setChapter(c))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [n]);

  // A hash beyond the last scene is clamped in place.
  useEffect(() => {
    if (revealed > total) navigate({ kind: 'night', n, revealed: total }, { replace: true });
  }, [revealed, total, n]);

  useEffect(() => {
    recordReached(n, shown);
  }, [n, shown]);

  // Warm the next night's chunk once the reader reaches the last scene.
  useEffect(() => {
    if (shown === total && n < CHAPTER_COUNT) void loadChapter(n + 1).catch(() => {});
  }, [shown, total, n]);

  // Focus management: a new night focuses its title; a newly revealed scene focuses its heading.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const headings = useRef(new Map<number, HTMLHeadingElement>());
  const prev = useRef<{ n: number; shown: number } | null>(null);
  useEffect(() => {
    if (!chapter) return;
    const before = prev.current;
    prev.current = { n, shown };
    if (before && before.n === n && shown > before.shown) {
      const el = headings.current.get(shown);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    } else if (!before || before.n !== n) {
      window.scrollTo(0, 0);
      titleRef.current?.focus({ preventScroll: true });
    }
  }, [chapter, n, shown, reduce]);

  const fraction = storyFraction(n, shown);
  const percent = Math.round(fraction * 100);
  const isLast = shown >= total;
  const beat = !isLast ? beatAfter(n, shown) : undefined;

  const onContinue = () => navigate({ kind: 'night', n, revealed: shown + 1 });
  const onChoose = (beatId: string, option: number) => {
    recordChoice(beatId, option);
    onContinue();
  };
  const onFinish = () => {
    markCompleted(n);
    navigate({ kind: 'done', n });
  };
  const onRevealAll = () => navigate({ kind: 'night', n, revealed: total });

  return (
    <>
      <header className="reader-bar">
        <div className="reader-bar-inner">
          <a className="btn btn-ghost btn-sm btn-icon" href={hashFor({ kind: 'nights' })} aria-label="All nights">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
          </a>
          <div className="reader-bar-title">
            <span className="reader-bar-night">
              Night <span className="num">{n}</span>
              <span className="visually-hidden"> of {CHAPTER_COUNT}</span>
            </span>
            <span className="reader-bar-place">{meta.place}</span>
          </div>
          <div className="reader-bar-tools">
            <span className="scene-dots" aria-hidden="true">
              {meta.scenes.map((s, i) => (
                <i key={s.id} className={i < shown ? 'on' : undefined} />
              ))}
            </span>
            <MoonPhase fraction={shown / total} id={`moon-${n}`} />
            <span className="visually-hidden">
              Scene {shown} of {total}.
            </span>
            <SettingsPopover />
          </div>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Story progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}% of the story`}
        >
          <div className="progress-fill" style={{ width: `${Math.max(0.5, fraction * 100)}%` }} />
        </div>
      </header>

      <article className="screen night" aria-labelledby="night-heading">
        <div className="night-head">
          <span className="eyebrow">
            Night <span className="num">{n}</span> of <span className="num">{CHAPTER_COUNT}</span>
          </span>
          <h1 id="night-heading" ref={titleRef} tabIndex={-1} className="night-title">
            {meta.title}
          </h1>
          <p className="night-dateline">{formatDateline(meta.place, meta.date)}</p>
        </div>

        {!chapter && !error && (
          <p className="status" role="status">
            Loading Night {n}…
          </p>
        )}
        {error && (
          <div className="status" role="alert">
            <p>Unable to load this night. Check your connection, then reload the page.</p>
            <p className="muted" style={{ marginBlockStart: 'var(--space-2)', fontSize: 'var(--text-label)' }}>
              {error}
            </p>
          </div>
        )}

        {chapter &&
          chapter.scenes.slice(0, shown).map((scene, i) => {
            const idx = i + 1;
            const priorBeat = beatBefore(n, idx);
            const choice = priorBeat ? progress.choices[priorBeat.id] : undefined;
            const aside = priorBeat && choice !== undefined ? priorBeat.options[choice]?.note : undefined;
            return (
              <SceneBlock
                key={scene.id}
                scene={scene}
                index={idx}
                total={total}
                recap={sceneRecapFor(scene.id)}
                aside={aside}
                reduceMotion={reduce}
                headingRef={(el) => {
                  if (el) headings.current.set(idx, el);
                  else headings.current.delete(idx);
                }}
              />
            );
          })}

        {chapter && (
          <div className="night-actions">
            {beat ? (
              <>
                <p className="beat-prompt" id={`beat-${beat.id}`}>
                  {beat.prompt}
                </p>
                <div className="beat-options" role="group" aria-labelledby={`beat-${beat.id}`}>
                  {beat.options.map((o, i) => (
                    <button key={o.label} type="button" className={i === 0 ? 'btn btn-primary' : 'btn'} onClick={() => onChoose(beat.id, i)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            ) : isLast ? (
              <>
                <p className="muted">End of Night {n}.</p>
                <button type="button" className="btn btn-primary btn-lg" onClick={onFinish}>
                  {n < CHAPTER_COUNT ? `Finish Night ${n}` : 'Finish the story'}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary btn-lg" onClick={onContinue}>
                  Continue
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onRevealAll}>
                  Show the whole night
                </button>
              </>
            )}
            {chapter && isLast && chapterRecapFor(n) && (
              <details className="recap" style={{ width: '100%', textAlign: 'start' }}>
                <summary>What happened tonight</summary>
                <p className="recap-body">{chapterRecapFor(n)}</p>
              </details>
            )}
          </div>
        )}

        <nav className="night-foot" aria-label="Between nights">
          {n > 1 ? (
            <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'night', n: n - 1, revealed: 1 })}>
              ← Night {n - 1}
            </a>
          ) : (
            <span />
          )}
          <a className="btn btn-ghost btn-sm" href={hashFor({ kind: 'nights' })}>
            All nights
          </a>
        </nav>
      </article>
    </>
  );
}
