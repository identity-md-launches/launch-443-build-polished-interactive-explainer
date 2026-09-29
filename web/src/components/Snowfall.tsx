import { useEffect, useRef } from 'react';

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
}

/**
 * Slow, sparse snow on a fixed canvas behind the page. Purely decorative: it is
 * aria-hidden, ignores pointer events, pauses when the tab is hidden and is not
 * mounted at all when the reader prefers reduced motion (unless they opt back in).
 */
export function Snowfall({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!active || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let last = performance.now();

    const spawn = (anywhere: boolean): Flake => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -8,
      r: 0.8 + Math.random() * 2.2,
      vy: 10 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 6,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(140, Math.round((w * h) / 16000));
      flakes = Array.from({ length: count }, () => spawn(true));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgb(236, 240, 255)';
      for (const f of flakes) {
        f.phase += dt * 0.7;
        f.x += (f.vx + Math.sin(f.phase) * 5) * dt;
        f.y += f.vy * dt * (0.4 + f.r / 3);
        if (f.y > h + 8) Object.assign(f, spawn(false));
        if (f.x < -8) f.x = w + 8;
        else if (f.x > w + 8) f.x = -8;
        ctx.globalAlpha = 0.18 + f.r / 6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      ctx.clearRect(0, 0, w, h);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={ref} className="snowfall" aria-hidden="true" />;
}
