/**
 * Light dismiss (CONTEXT.md "Light dismiss", ADR-0050): the platform's rule
 * for closing a transient surface from the pointer, shared by every surface
 * that implements dismissal itself — the anchored field panels
 * (`useAnchoredPanel`), the popover chain and `c-menu`, all of which are
 * `popover="manual"` and so get nothing from the browser.
 *
 * A native `popover="auto"` does not close on `pointerdown`: the browser
 * remembers where the press landed and dismisses on the matching `pointerup`
 * only when *both* fell outside. A touch scroll begins with a `pointerdown`
 * and turns into `pointercancel`, never `pointerup`, so scrolling the page
 * under an open surface leaves it open. The hand-rolled `pointerdown`
 * listeners this module replaces closed the panel on the first touch of every
 * scroll — the bug that made `c-tree-select` unusable on a phone.
 *
 * Listeners are capture-phase on `document`, like the ones they replace, so a
 * consumer's `stopPropagation()` cannot hide an outside press from them.
 */

/** Detach the listeners `attachPointerPair` / `attachLightDismiss` installed. Idempotent. */
export type Detach = () => void;

/**
 * Report each completed primary-pointer press-and-release pair with both
 * composed paths. A press that ends in `pointercancel` — a touch that became a
 * scroll or a pan — is dropped, and a release with no press seen since attach
 * (the gesture that opened the surface) is ignored.
 */
export const attachPointerPair = (
  onPair: (down: EventTarget[], up: EventTarget[]) => void,
): Detach => {
  let downPath: EventTarget[] | null = null;

  const onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary) return;

    downPath = event.composedPath();
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!event.isPrimary) return;

    const down = downPath;

    downPath = null;

    if (down) onPair(down, event.composedPath());
  };

  const onPointerCancel = (): void => {
    downPath = null;
  };

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', onPointerUp, true);
  document.addEventListener('pointercancel', onPointerCancel, true);

  return () => {
    downPath = null;
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('pointerup', onPointerUp, true);
    document.removeEventListener('pointercancel', onPointerCancel, true);
  };
};

export interface LightDismissOptions {
  /** True when a composed event path passes through the surface's own inside (host subtree, panel, designated trigger). */
  isInside(path: EventTarget[]): boolean;
  /** The press and its release both landed outside: close the surface. */
  onDismiss(): void;
}

/** The single-surface case: dismiss when press and release both landed outside. */
export const attachLightDismiss = (options: LightDismissOptions): Detach =>
  attachPointerPair((down, up) => {
    if (!options.isInside(down) && !options.isInside(up)) options.onDismiss();
  });
