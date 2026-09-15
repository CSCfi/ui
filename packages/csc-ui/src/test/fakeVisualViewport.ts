/**
 * A faked on-screen keyboard for specs (ADR-0049, ADR-0050). Headless
 * Chromium has no keyboard, so nothing ever shrinks `window.visualViewport`
 * there — and the **fullscreen panel** follows that API and nothing else. So a
 * spec drives the same code path a phone does by replacing the API's getters
 * and firing its `resize` event. WebIDL attributes live as configurable
 * accessors on `VisualViewport.prototype`, which is what makes the swap (and
 * the restore) possible.
 */

/** The box the faked visual viewport reports, in CSS px relative to the layout viewport. */
export interface FakeViewportBox {
  height: number;
  /** Default 0. */
  offsetLeft?: number;
  offsetTop: number;
  /** Default: the layout viewport's width (a keyboard never narrows it). */
  width?: number;
}

const KEYS = ['height', 'offsetLeft', 'offsetTop', 'width'] as const;

/**
 * Report `box` from `window.visualViewport` and fire `resize`. Returns the
 * restore, which puts the real accessors back and fires `resize` again — call
 * it in a `finally`: the browser page is shared across spec files.
 */
export function fakeVisualViewport(box: FakeViewportBox): () => void {
  const proto = VisualViewport.prototype;

  const originals = KEYS.map(
    (key) => [key, Object.getOwnPropertyDescriptor(proto, key)!] as const,
  );

  const values: Record<(typeof KEYS)[number], number> = {
    height: box.height,
    offsetLeft: box.offsetLeft ?? 0,
    offsetTop: box.offsetTop,
    width: box.width ?? document.documentElement.clientWidth,
  };

  for (const key of KEYS) {
    Object.defineProperty(proto, key, {
      configurable: true,
      get: () => values[key],
    });
  }

  window.visualViewport!.dispatchEvent(new Event('resize'));

  return () => {
    for (const [key, descriptor] of originals) {
      Object.defineProperty(proto, key, descriptor);
    }

    window.visualViewport!.dispatchEvent(new Event('resize'));
  };
}
