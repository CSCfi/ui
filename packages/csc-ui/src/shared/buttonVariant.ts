/**
 * The colour variant of c-button and c-icon-button. `variant` names it (an
 * app default can change the built-in `primary`); until 5.0 the deprecated
 * `danger` boolean still picks `danger` while `variant` is unset on the
 * element (ADR-0074, ADR-0079).
 */
import { coerceBoolean } from './coerceBoolean';

/**
 * `danger` read as a variant, the mapper `appDefault` takes for it: set →
 * `danger`; unset or `"false"` → undefined, so the app default still applies.
 */
export const dangerAsVariant = (value: unknown): 'danger' | undefined =>
  coerceBoolean(value) ? 'danger' : undefined;
