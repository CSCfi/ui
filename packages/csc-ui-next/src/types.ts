/**
 * Public TypeScript types for csc-ui-next components.
 *
 * Re-exported from the package entry (`src/index.ts`) so consumers can type the
 * value they bind / the items they pass without redeclaring the shapes:
 *
 *   import type { CAutocompleteItem } from '@cscfi/csc-ui-next';
 *
 * These describe the public API only (the selected value, the items, the filter
 * predicate); internal component state is not exported.
 */

/**
 * Custom filter predicate for `c-autocomplete`. Return `true` to keep the
 * option for the current query. The default matches the start of the label.
 */
export type CAutocompleteFilter = (
  option: CAutocompleteOption,
  query: string,
) => boolean;

/**
 * A `c-autocomplete` item. Identical shape to {@link CSelectItem}; aliased for
 * a name that reads naturally at the autocomplete call site.
 */
export type CAutocompleteItem = CSelectItem;

/**
 * The normalized option handed to a `c-autocomplete` `filter` predicate. `label`
 * is the option's `name` (or its trimmed text content when authored as a
 * slotted `<c-option>`).
 */
export interface CAutocompleteOption {
  /** Whether the option is disabled. */
  disabled: boolean;
  /** The option's display label. */
  label: string;
  /** The option's value. */
  value: number | string;
}

/**
 * A selectable item for the value-selection components (`c-select`,
 * `c-autocomplete`) when options are supplied via the `items` prop instead of
 * slotted `<c-option>` elements.
 */
export interface CSelectItem {
  /** Disable the item so it cannot be selected. */
  disabled?: boolean;
  /** The item's display label. */
  name: string;
  /** The value emitted via v-model when the item is selected. */
  value: number | string;
}
