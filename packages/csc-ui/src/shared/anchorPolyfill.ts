/**
 * Runtime loader for the OddBird CSS anchor-positioning polyfill.
 *
 * `c-menu` / `c-menu-item` position their popover panels with native CSS
 * anchor positioning (`anchor-name` / `position-anchor` / `position-area`).
 * Chrome/Edge (125+) and Safari (26+) support this natively; Firefox does
 * not yet. Where the feature is missing we lazily load OddBird's polyfill and
 * run it against the calling component's shadow root.
 *
 * Notes / known limits (verify in Firefox):
 *  - The polyfill's weakest area is shadow DOM + top-layer popovers. We pass
 *    the component's own ShadowRoot in `roots` so its anchor/target elements
 *    are discovered; the anchor name and target both live in that one root, so
 *    no reference crosses a shadow boundary.
 *  - `useAnimationFrame: true` keeps positions in sync on scroll/resize the way
 *    the native engine does, at the cost of a rAF loop while a menu is mounted.
 */

type PolyfillFn = (opts?: boolean | PolyfillOptions) => Promise<unknown>;

type PolyfillOptions = {
  roots?: unknown[];
  useAnimationFrame?: boolean;
};

let polyfillFn: null | Promise<PolyfillFn> = null;

/** True when the browser positions anchors without a polyfill. */
export const supportsAnchorPositioning = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('anchor-name: --x') &&
  CSS.supports('position-anchor: --x');

const loadPolyfill = (): Promise<PolyfillFn> => {
  if (!polyfillFn) {
    polyfillFn = import('@oddbird/css-anchor-positioning/fn').then(
      (m) =>
        (m.default ?? (m as { polyfill?: PolyfillFn }).polyfill) as PolyfillFn,
    );
  }

  return polyfillFn;
};

/**
 * Ensure anchored elements inside `root` are positioned. No-op on browsers
 * with native support. Safe to call on every open; the import is cached.
 */
export const ensureAnchorPositioning = async (
  root: Document | HTMLElement | null | ShadowRoot | undefined,
): Promise<void> => {
  if (!root || supportsAnchorPositioning()) return;

  try {
    const run = await loadPolyfill();

    await run({ roots: [root], useAnimationFrame: true });
  } catch {
    // A failed polyfill load must not break menu interaction; the panel just
    // falls back to its unanchored default position.
  }
};
