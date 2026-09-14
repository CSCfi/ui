/**
 * A non-decreasing `Date.now()` for the browser harness.
 *
 * Vue stamps every native event with `Date.now()` the first time one of its
 * listeners sees it, and every listener attached at or after that stamp drops
 * the event (`createInvoker` in @vue/runtime-dom, the vuejs/vue#6566 guard).
 * The devcontainer's wall clock steps BACKWARDS by ~135 ms every few seconds
 * (the VM re-syncing to its host; measured on 2026-09-14 in Node and in
 * Chromium alike), so a click that lands within a step of a mount is silently
 * discarded — no error, no handler — and specs that mount and click within
 * ~50 ms lost one click in roughly 3% of file runs.
 *
 * `monotonicClock(source)` absorbs a backwards step into an offset: the value
 * never decreases, moves one millisecond past the last reading when it detects
 * a step (a stamp taken right after the step must be strictly later than the
 * attach stamp taken right before it — Vue compares with `<=`), and keeps
 * advancing with real time afterwards. The browser setup installs it over
 * `Date.now`; `monotonicClock.spec.ts` reproduces the hazard with a stepping
 * fake clock and shows the shim closing it.
 */
export const monotonicClock = (source: () => number): (() => number) => {
  let offset = 0;

  let last = Number.NEGATIVE_INFINITY;

  return () => {
    let now = source() + offset;

    if (now < last) {
      offset += last + 1 - now;
      now = last + 1;
    }

    last = now;

    return now;
  };
};
