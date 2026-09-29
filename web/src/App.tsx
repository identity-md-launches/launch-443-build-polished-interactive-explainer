import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { useProgress } from './lib/progress';
import { usePrefersReducedMotion } from './lib/motion';
import { Snowfall } from './components/Snowfall';
import { TitleScreen } from './components/TitleScreen';
import { NightsMenu } from './components/NightsMenu';
import { Reader } from './components/Reader';
import { NightEnd } from './components/NightEnd';
import { Finale } from './components/Finale';
import { About } from './components/About';

export function App() {
  const route = useRoute();
  const { prefs } = useProgress();
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.textSize = prefs.textSize;
  }, [prefs.textSize]);

  useEffect(() => {
    const titles: Record<string, string> = {
      title: 'Snowmoon — a story by Vitalik Buterin',
      nights: 'All nights — Snowmoon',
      about: 'About — Snowmoon',
      end: 'The end — Snowmoon',
    };
    document.title =
      route.kind === 'night' || route.kind === 'done' ? `Night ${route.n} — Snowmoon` : (titles[route.kind] ?? 'Snowmoon');
  }, [route]);

  const snow = prefs.snow === 'on' || (prefs.snow === 'auto' && !reduce);

  let screen;
  switch (route.kind) {
    case 'nights':
      screen = <NightsMenu />;
      break;
    case 'about':
      screen = <About />;
      break;
    case 'end':
      screen = <Finale />;
      break;
    case 'night':
      screen = <Reader n={route.n} revealed={route.revealed} />;
      break;
    case 'done':
      screen = <NightEnd n={route.n} />;
      break;
    default:
      screen = <TitleScreen />;
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Snowfall active={snow} />
      <main id="main">{screen}</main>
    </div>
  );
}
