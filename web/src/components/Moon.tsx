/** Decorative moon for the title and ending screens. */
export function Moon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="oklch(0.93 0.06 92)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.93 0.06 92)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-face" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="oklch(0.97 0.03 92)" />
          <stop offset="70%" stopColor="oklch(0.9 0.06 92)" />
          <stop offset="100%" stopColor="oklch(0.8 0.07 92)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#moon-glow)" opacity="0.35" />
      <circle cx="100" cy="100" r="72" fill="url(#moon-face)" />
      <g fill="oklch(0.78 0.06 92)" opacity="0.55">
        <circle cx="74" cy="82" r="9" />
        <circle cx="118" cy="66" r="5" />
        <circle cx="126" cy="112" r="12" />
        <circle cx="88" cy="126" r="6" />
        <circle cx="104" cy="96" r="3.5" />
      </g>
    </svg>
  );
}

/** A small moon that fills as scenes of a night are read. */
export function MoonPhase({ fraction, id }: { fraction: number; id: string }) {
  const f = Math.max(0, Math.min(1, fraction));
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * f} height="24" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10" fill="oklch(0.34 0.035 268)" />
      <circle cx="12" cy="12" r="10" fill="oklch(0.87 0.08 92)" clipPath={`url(#${id})`} />
    </svg>
  );
}
