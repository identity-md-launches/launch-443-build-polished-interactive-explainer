// jsdom lacks a few browser APIs the reader touches. Reduced motion is reported as
// "reduce" so tests exercise the motion-stripping path and skip the snow canvas.
Element.prototype.scrollIntoView = function scrollIntoView() {};
window.scrollTo = () => {};
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList;
}
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];
