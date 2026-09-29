import { useId } from 'react';
import { setSnowPref, setTextSize, useProgress, type TextSize } from '../lib/progress';
import { usePrefersReducedMotion } from '../lib/motion';

const SIZES: { value: TextSize; label: string }[] = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
];

/** Text size and snow controls. Rendered inside the reader bar popover and on the About page. */
export function SettingsFields() {
  const { prefs } = useProgress();
  const reduce = usePrefersReducedMotion();
  const group = useId();
  const snowOn = prefs.snow === 'on' || (prefs.snow === 'auto' && !reduce);
  return (
    <>
      <fieldset>
        <legend className="eyebrow">Text size</legend>
        <div className="seg">
          {SIZES.map((s) => (
            <label key={s.value}>
              <input
                type="radio"
                name={`${group}-size`}
                value={s.value}
                checked={prefs.textSize === s.value}
                onChange={() => setTextSize(s.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={snowOn} onChange={(e) => setSnowPref(e.target.checked ? 'on' : 'off')} />
        Falling snow
      </label>
    </>
  );
}

export function SettingsPopover() {
  return (
    <details className="settings">
      <summary className="btn btn-ghost btn-sm" aria-label="Display settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
        <span>Display</span>
      </summary>
      <div className="settings-panel">
        <SettingsFields />
      </div>
    </details>
  );
}
