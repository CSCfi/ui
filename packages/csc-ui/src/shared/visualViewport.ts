/**
 * Visual viewport tracking for the **fullscreen panel** (CONTEXT.md,
 * ADR-0050). A `position: fixed` top-layer surface sized with `100dvh` does
 * not shrink when the on-screen keyboard opens on iOS — only the
 * `visualViewport` API reports the visible box there. Both fullscreen
 * implementations (the anchored-panel composable and `c-dropdown`'s dialog)
 * follow it through this one helper while they are open.
 */

/** Stop following the visual viewport. Idempotent. */
export type StopTracking = () => void;

/** The visible box, in CSS px relative to the layout viewport. */
export interface ViewportBox {
  height: number;
  left: number;
  top: number;
  width: number;
}

/** The current visual viewport box; `null` where the API is missing (then size with `100dvh`). */
export const readVisualViewport = (): null | ViewportBox => {
  const vv = typeof window === 'undefined' ? null : window.visualViewport;

  if (!vv) return null;

  return {
    height: vv.height,
    left: vv.offsetLeft,
    top: vv.offsetTop,
    width: vv.width,
  };
};

/**
 * Report the visual viewport's box now and on every resize / scroll of it
 * (the keyboard opening and closing, the address bar collapsing, the browser
 * panning a focused input into view). With no API the callback runs once
 * with `null` and nothing is listened to.
 */
export const trackVisualViewport = (
  onBox: (box: null | ViewportBox) => void,
): StopTracking => {
  const vv = typeof window === 'undefined' ? null : window.visualViewport;

  onBox(readVisualViewport());

  if (!vv) return () => {};

  const update = (): void => onBox(readVisualViewport());

  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);

  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
  };
};

/**
 * Inline declarations that make a `position: fixed` surface the visual
 * viewport's box — or, with no box, the layout viewport (`100dvh`). Both
 * override the UA popover / dialog defaults (`inset: 0`, fit-content sizing,
 * auto margins).
 */
export const fullscreenBoxStyle = (box: null | ViewportBox): string =>
  box
    ? `inset:auto;top:${box.top}px;left:${box.left}px;width:${box.width}px;height:${box.height}px;`
    : 'inset:0;width:auto;height:100dvh;';

/** The same box written straight onto an element's inline style (for a surface whose placement is imperative, like `c-dropdown`'s dialog). */
export const applyFullscreenBox = (
  el: HTMLElement,
  box: null | ViewportBox,
): void => {
  if (box) {
    el.style.inset = 'auto';
    el.style.top = `${box.top}px`;
    el.style.left = `${box.left}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
  } else {
    el.style.inset = '0';
    el.style.width = 'auto';
    el.style.height = '100dvh';
  }
};
