import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { CHAPTERS } from '../src/lib/content';
import { resetProgress, getProgress } from '../src/lib/progress';
import { BEATS } from '../src/content/beats';

async function setHash(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

const progressValue = () => Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'));

async function clickAndSettle(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
    // anchors with hash hrefs: jsdom updates location.hash, then fires hashchange on a task
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('reader flow', () => {
  beforeEach(() => {
    resetProgress();
    window.location.hash = '';
  });
  afterEach(cleanup);

  it('shows the title screen and starts Night 1 from it', async () => {
    await setHash('#/');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Snowmoon' })).toBeTruthy();
    await clickAndSettle(screen.getByRole('link', { name: 'Begin Night 1' }));
    await screen.findByRole('heading', { level: 2, name: /Scene 1 of 6/ });
    expect(screen.getByText(/Gladias was walking along a foot path/)).toBeTruthy();
    expect(document.title).toContain('Night 1');
  });

  it('reveals scenes one at a time, offers canon-only choices, and plays all 32 nights in order', async () => {
    await setHash('#/night/1');
    render(<App />);

    let lastProgress = -1;
    for (const chapter of CHAPTERS) {
      const n = chapter.number;
      const total = chapter.scenes.length;
      await screen.findByRole('heading', { level: 1, name: `Chapter ${n}` });
      await screen.findByRole('heading', { level: 2, name: new RegExp(`^Scene 1 of ${total}(\\b|$)`) });

      for (let shown = 1; shown < total; shown++) {
        const beat = BEATS.find((b) => b.chapter === n && b.afterScene === shown);
        if (beat) {
          const buttons = beat.options.map((o) => screen.getByRole('button', { name: o.label }));
          expect(buttons).toHaveLength(2);
          await clickAndSettle(buttons[shown % 2]);
          await screen.findByText(beat.options[shown % 2].note);
        } else {
          await clickAndSettle(screen.getByRole('button', { name: 'Continue' }));
        }
        await screen.findByRole('heading', { level: 2, name: new RegExp(`^Scene ${shown + 1} of ${total}(\\b|$)`) });
        // earlier scenes stay on the page
        expect(screen.getByRole('heading', { level: 2, name: new RegExp(`^Scene 1 of ${total}(\\b|$)`) })).toBeTruthy();
        expect(window.location.hash).toBe(`#/night/${n}/${shown + 1}`);
      }

      const p = progressValue();
      expect(p).toBeGreaterThanOrEqual(lastProgress);
      lastProgress = p;

      const finish = screen.getByRole('button', { name: n < 32 ? `Finish Night ${n}` : 'Finish the story' });
      await clickAndSettle(finish);
      await screen.findByText('Night complete');
      expect(getProgress().completed).toContain(n);

      if (n < 32) {
        await clickAndSettle(screen.getByRole('link', { name: `Continue to Night ${n + 1}` }));
      } else {
        await clickAndSettle(screen.getByRole('link', { name: 'See the ending' }));
      }
    }

    await screen.findByRole('heading', { level: 1, name: 'The end' });
    expect(lastProgress).toBe(100);
    expect(getProgress().completed).toHaveLength(32);
  }, 180_000);

  it('clamps a hash past the last scene and restores the reading position', async () => {
    await setHash('#/night/2/99');
    render(<App />);
    await screen.findByRole('heading', { level: 2, name: /Scene 4 of 4/ });
    await waitFor(() => expect(window.location.hash).toBe('#/night/2/4'));
    expect(screen.getByRole('button', { name: 'Finish Night 2' })).toBeTruthy();
    expect(getProgress().furthest).toEqual({ chapter: 2, scene: 4 });
    cleanup();
    await setHash('#/');
    render(<App />);
    expect(screen.getByRole('link', { name: 'Continue Night 2' }).getAttribute('href')).toBe('#/night/2/4');
  });

  it('lists all 32 nights in the menu with places and dates', async () => {
    await setHash('#/nights');
    render(<App />);
    const links = screen.getAllByRole('link', { name: /^Night \d+/ });
    expect(links).toHaveLength(32);
    expect(links[0].textContent).toContain('Meldan, Veridia');
    expect(links[31].getAttribute('href')).toBe('#/night/32');
  });

  it('strips SMIL animation under reduced motion', async () => {
    await setHash('#/night/4/4');
    render(<App />);
    await screen.findByRole('heading', { level: 2, name: /Scene 4 of 4/ });
    expect(document.querySelectorAll('animate').length).toBe(0);
    expect(document.querySelectorAll('.scene-body svg').length).toBeGreaterThan(0);
  });
});
