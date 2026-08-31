import { useHost } from 'vue';

/**
 * Host custom-state exposure — the single path for publishing a component's
 * internal state to consumer CSS as `:state(<name>)` selectors (ADR-0035).
 *
 * Selection controls keep their live state (checked, indeterminate, …) on a
 * hidden `<input>` inside the shadow root, where no consumer selector can see
 * it. `ElementInternals.states` republishes it on the host, so a consumer can
 * write per-state `::part()` rules:
 *
 *   c-checkbox:state(checked)::part(indicator) { background: green; }
 *
 * Usage:
 *
 *   const setState = useHostStates();
 *   watch(isChecked, (on) => setState('checked', on), { immediate: true });
 *
 * Each exposed state name is public API — curated like parts, documented with
 * a `@cssstate` docblock tag so it lands in the manifest.
 *
 * `attachInternals()` may be called only once per element; this composable
 * owns that call. Everything degrades to a silent no-op where internals or
 * `states` are unavailable (SSR, tests, an ancient browser) — the component
 * still renders and behaves, only the `:state()` selector surface is absent.
 */
export const useHostStates = (): ((name: string, on: boolean) => void) => {
  const host = useHost();

  let states: CustomStateSet | null = null;

  try {
    states = host?.attachInternals().states ?? null;
  } catch {
    states = null;
  }

  return (name, on) => {
    if (on) states?.add(name);
    else states?.delete(name);
  };
};
