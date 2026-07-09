/**
 * Emit a model-value change so BOTH the legacy `v-control` directive and a
 * plain Vue `v-model` (no directive) stay in sync.
 *
 * Background: `v-model` on a custom element compiles to Vue's *native* DOM model
 * runtime (`vModelText`) — it reads `el.value` from inside an `input` listener.
 * The csc-ui components historically emitted only the `changeValue` /
 * `update:value` CustomEvents, so a plain `v-model` heard nothing; the
 * `v-control` directive was required to translate `changeValue` into
 * `el.value = …` + a native `input`. This helper bakes that translation into the
 * component itself:
 *
 *   1. mirror the new value onto the host's own `value` property (so native
 *      v-model reads the fresh value when `input` fires),
 *   2. emit the legacy `changeValue` + `update:value` CustomEvents (kept for
 *      existing `@changeValue` listeners and the `v-control` directive),
 *   3. dispatch a native, bubbling `input` event (what plain `v-model` listens
 *      for).
 *
 * IMPORTANT: writing `host.value` re-enters the component's `props.value` watch.
 * That watch must only re-sync internal state / visuals — it must NEVER call
 * this helper (or otherwise emit), or it will loop with v-model. Call this ONLY
 * from user-interaction handlers, never from a value watcher.
 */
export const emitModelValue = (
  host: HTMLElement | null,
  value: unknown,
): void => {
  if (!host) return;

  const el = host as { value?: unknown } & HTMLElement;

  // Mirror the value onto the element's own property before emitting `input`,
  // so native v-model (which reads `el.value` in its handler) sees it.
  if (el.value !== value) el.value = value;
  host.dispatchEvent(new CustomEvent('changeValue', { detail: value }));
  // Kebab-case twin (ADR-0021): Vue templates can only bind hyphenated
  // listener names, so `@change-value` hears this one.
  host.dispatchEvent(new CustomEvent('change-value', { detail: value }));
  host.dispatchEvent(new CustomEvent('update:value', { detail: value }));
  host.dispatchEvent(new Event('input', { bubbles: true }));
};
