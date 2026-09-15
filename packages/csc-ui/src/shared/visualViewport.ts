/**
 * Visual viewport tracking for the **fullscreen panel** (CONTEXT.md,
 * ADR-0050). Two layers. The *surface* — the panel element itself,
 * `position: fixed; inset: 0` — spans the layout viewport, which the
 * on-screen keyboard overlays but never shrinks, so it covers everything
 * visible whatever the keyboard does. The *content box* inside it (heading
 * row, search input, list) follows `visualViewport` — the only API that sees
 * the iOS keyboard — so it ends above the keyboard. A late or wrong box then
 * shows more surface, never the page. Both fullscreen implementations (the
 * anchored-panel composable and `c-dropdown`'s dialog) go through this one
 * helper while they are open.
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

/** The current visual viewport box; `null` where the API is missing (then the content box fills the surface). */
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
 * Inline declarations that make a top-layer element the surface: the layout
 * viewport's box. Overrides the UA popover / dialog defaults (`inset: 0` is
 * theirs too, but with fit-content sizing and auto margins).
 */
export const FULLSCREEN_SURFACE_STYLE =
  'position:fixed;inset:0;margin:0;width:auto;height:auto;';

/**
 * Inline declarations placing the content box inside the surface on the
 * visual viewport's box; with no box (no API) it fills the surface.
 */
export const contentBoxStyle = (box: null | ViewportBox): string =>
  box
    ? `position:absolute;inset:auto;top:${box.top}px;left:${box.left}px;width:${box.width}px;height:${box.height}px;`
    : 'position:absolute;inset:0;';

/**
 * `FULLSCREEN_SURFACE_STYLE` written straight onto an element's inline style,
 * for a surface whose placement is imperative (`c-dropdown`'s dialog). Margins
 * are left to its classes.
 */
export const applyFullscreenSurface = (el: HTMLElement): void => {
  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.width = 'auto';
  el.style.height = 'auto';
};

/** `contentBoxStyle(box)` written straight onto an element's inline style. */
export const applyContentBox = (
  el: HTMLElement,
  box: null | ViewportBox,
): void => {
  el.style.position = 'absolute';

  if (box) {
    el.style.inset = 'auto';
    el.style.top = `${box.top}px`;
    el.style.left = `${box.left}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
  } else {
    el.style.inset = '0';
    el.style.width = '';
    el.style.height = '';
  }
};

/** Remove exactly what `applyContentBox` set. */
export const clearContentBox = (el: HTMLElement): void => {
  for (const property of [
    'position',
    'inset',
    'top',
    'left',
    'width',
    'height',
  ]) {
    el.style.removeProperty(property);
  }
};
