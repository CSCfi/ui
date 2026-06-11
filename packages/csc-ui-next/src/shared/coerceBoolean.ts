/**
 * Coerce a value into a true boolean.
 *
 * Why this exists: Vue 3.5's `defineCustomElement` does not always coerce
 * attribute *presence* into `true` for declared Boolean props. With
 * `<c-tabs disable-animation>`, `props.disableAnimation` arrives as the
 * raw string `""` rather than the boolean `true`. The empty string is
 * falsy, so `!props.disableAnimation` reads as `true` and the component
 * behaves the opposite of what the consumer asked for.
 *
 * Standard HTML boolean attribute semantics:
 *   present (any value, including "")  → true
 *   missing                            → false
 *   string "false"                     → false (explicit opt-out)
 *
 * Apply this helper anywhere a Boolean prop is used in conditional logic
 * to defend against the empty-string passthrough.
 */
export const coerceBoolean = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (v === '' || v === 'true') return true;
  if (v == null || v === 'false') return false;
  return Boolean(v);
};
