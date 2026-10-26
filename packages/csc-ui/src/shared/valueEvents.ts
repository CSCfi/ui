/**
 * The value events of a value control (CONTEXT.md "Value events", ADR-0075),
 * with native `<input>` timing: `input` (no detail) and `update:value` (the
 * value) on every value change, `change` (the value) on every **commit** —
 * Enter or leaving the field for typed text, each pick in a list or panel,
 * the release that ends a drag. None of them leaves the host but `input`,
 * which bubbles as a native one does; `change` stays on the host so a field
 * inside an accordion or a modal never reaches the container's own `change`.
 *
 * Each helper first mirrors the value onto the host's own `value` property:
 * `v-model` on a custom element compiles to Vue's native `vModelText`, which
 * reads `el.value` inside its `input` listener.
 *
 * IMPORTANT: writing `host.value` re-enters the component's `props.value`
 * watch. That watch must only re-sync internal state and visuals — it must
 * NEVER call a helper here (or otherwise emit), or it loops with v-model. Call
 * these ONLY from user-interaction handlers, never from a value watcher.
 *
 * Declare the events a helper dispatches in the component's event map; the
 * docs analyzer enforces it for every caller.
 */

const mirror = (host: HTMLElement, value: unknown): void => {
  const el = host as { value?: unknown } & HTMLElement;

  if (el.value !== value) el.value = value;
};

/**
 * A change not yet committed (a keystroke, one move of a drag): `update:value`
 * and `input`, no `change`. The commit follows as one `emitModelSettled`, as a
 * native range input fires `input` per move and `change` on release.
 */
export const emitModelInput = (
  host: HTMLElement | null,
  value: unknown,
): void => {
  if (!host) return;

  mirror(host, value);
  host.dispatchEvent(new CustomEvent('update:value', { detail: value }));
  host.dispatchEvent(new Event('input', { bubbles: true }));
};

/** The `change` that commits what `emitModelInput` reported. */
export const emitModelSettled = (
  host: HTMLElement | null,
  value: unknown,
): void => {
  host?.dispatchEvent(new CustomEvent('change', { detail: value }));
};

/**
 * A change that is also its commit (a pick, a toggle): `update:value` and
 * `input`, then `change`, in a native control's order.
 */
export const emitModelChange = (
  host: HTMLElement | null,
  value: unknown,
): void => {
  emitModelInput(host, value);
  emitModelSettled(host, value);
};
