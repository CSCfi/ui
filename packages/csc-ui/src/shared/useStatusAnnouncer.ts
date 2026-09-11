/**
 * Debounced polite live region for a component's status text — the
 * announcer behind the visually hidden `aria-live="polite" aria-atomic="true"`
 * region a value-selection field renders (`c-autocomplete`, `c-tree-select`).
 *
 * The 1400 ms debounce is the cadence every list panel in the library uses
 * (`c-dropdown` / `c-select` keep their own copies for now — `set()` is the
 * seam for a later refit): a screen reader must not hear every keystroke's
 * intermediate count, only where the user came to rest. `announce()` takes a
 * *compose* thunk rather than a string on purpose — it runs when the timer
 * fires, so it reads the state current *then* (a fetch landing during the
 * debounce is announced correctly).
 *
 * The region itself stays a template snippet in the consumer: it has no
 * `part` and no slot, so a shared SFC would add an analyzer-scanned import
 * and a child instance for no contract gain.
 */

import { onBeforeUnmount, type Ref, ref } from 'vue';

export interface StatusAnnouncer {
  /** Schedule an announcement. `compose` runs when the debounce fires, so it reads the state current *then*; every call restarts the timer. */
  announce(compose: () => string): void;
  /** Drop a pending announcement (also runs on unmount). */
  cancel(): void;
  /** Write immediately, dropping any pending announcement. */
  set(text: string): void;
  /** The live text; bind as the content of the `aria-live="polite" aria-atomic="true"` region. */
  text: Readonly<Ref<string>>;
}

export interface UseStatusAnnouncerOptions {
  /** Debounce before a scheduled announcement lands, in ms. Default 1400. */
  delay?: number;
}

export const useStatusAnnouncer = ({
  delay = 1400,
}: UseStatusAnnouncerOptions = {}): StatusAnnouncer => {
  const text = ref('');

  let timer: null | number = null;

  const cancel = (): void => {
    if (timer === null) return;

    clearTimeout(timer);
    timer = null;
  };

  const announce = (compose: () => string): void => {
    cancel();

    timer = window.setTimeout(() => {
      timer = null;
      text.value = compose();
    }, delay);
  };

  const set = (next: string): void => {
    cancel();
    text.value = next;
  };

  onBeforeUnmount(cancel);

  return { announce, cancel, set, text };
};
