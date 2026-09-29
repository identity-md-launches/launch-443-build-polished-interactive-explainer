import { useMemo } from 'react';
import type { Scene } from '../lib/content';
import { formatDateline } from '../lib/content';
import { stripMotion } from '../lib/motion';

interface Props {
  scene: Scene;
  index: number;
  total: number;
  recap?: string;
  aside?: string;
  reduceMotion: boolean;
  headingRef?: (el: HTMLHeadingElement | null) => void;
}

export function SceneBlock({ scene, index, total, recap, aside, reduceMotion, headingRef }: Props) {
  const html = useMemo(() => (reduceMotion ? stripMotion(scene.html) : scene.html), [scene.html, reduceMotion]);
  const headingId = `scene-${scene.id}`;
  const dateline = formatDateline(scene.place, scene.date);
  return (
    <section className="scene" aria-labelledby={headingId}>
      <h2 id={headingId} className="scene-heading" tabIndex={-1} ref={headingRef}>
        <span>
          Scene <span className="num">{index}</span> of <span className="num">{total}</span>
        </span>
        {dateline && <span className="scene-dateline">{dateline}</span>}
      </h2>
      {aside && <p className="scene-aside">{aside}</p>}
      {/* Story HTML comes from the pinned upstream pages via scripts/extract-chapters.mjs (scripts and handlers stripped). */}
      <div className="scene-body" dangerouslySetInnerHTML={{ __html: html }} />
      {recap && (
        <details className="recap">
          <summary>What just happened</summary>
          <p className="recap-body">{recap}</p>
        </details>
      )}
    </section>
  );
}
