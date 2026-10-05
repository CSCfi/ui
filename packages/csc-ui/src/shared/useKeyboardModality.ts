/**
 * Keyboard modality (CONTEXT.md "Keyboard modality"): whether the latest
 * press a component saw was a key rather than a pointer press. Shared by the
 * picker panels (`c-date-picker`, `c-time-picker`), which move real DOM focus
 * by script — onto a day, a column row, the next stop of their focus trap.
 *
 * The browsers' `:focus-visible` heuristics miss the panels' keyboard paths.
 * Chrome ignores a keydown that carries Alt, Ctrl or Meta, so Alt+↓ in a
 * clicked field opens the panel without a ring; Firefox and Safari carry the
 * field's mouse focus through every script `focus()`, so not even the arrow
 * keys bring the ring back. `focus({ focusVisible: true })` overrides them.
 *
 * Every keydown counts, chords included; a pointer press ends it. Both
 * listeners are capture-phase on the host: key and pointer events are
 * composed, so presses in the field, the cells and the panel's buttons all
 * pass through it, and a `stopPropagation()` inside cannot hide one.
 */
import { getCurrentScope, onScopeDispose } from 'vue';

/**
 * Track the host's keyboard modality for the lifetime of the current effect
 * scope. Returns `focusOptions`, which adds `focusVisible: true` to a script
 * focus under keyboard modality and otherwise leaves the browser to decide —
 * never `focusVisible: false`.
 */
export const useKeyboardModality = (
  host: HTMLElement | null | undefined,
): ((options?: FocusOptions) => FocusOptions) => {
  let keyboard = false;

  const onKeyDown = (): void => {
    keyboard = true;
  };

  const onPointerDown = (): void => {
    keyboard = false;
  };

  host?.addEventListener('keydown', onKeyDown, true);
  host?.addEventListener('pointerdown', onPointerDown, true);

  if (getCurrentScope()) {
    onScopeDispose(() => {
      host?.removeEventListener('keydown', onKeyDown, true);
      host?.removeEventListener('pointerdown', onPointerDown, true);
    });
  }

  return (options = {}) =>
    keyboard ? { ...options, focusVisible: true } : options;
};
