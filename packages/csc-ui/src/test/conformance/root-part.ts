/**
 * Tags whose shadow root carries no `root` part — the c-input-wrapping fields
 * (the nested c-input owns the root) and slot-only elements. Derived from the
 * manifest; the API snapshot spec cross-checks it, the all-components suite
 * asserts it in both directions so it cannot rot.
 */
export const NO_ROOT_PART: readonly string[] = [
  'c-autocomplete',
  'c-dropdown',
  'c-login-buttons',
  'c-menu',
  'c-option',
  'c-option-value',
  'c-page',
  'c-popover',
  'c-select',
  'c-table',
  'c-tabs',
  'c-text-field',
  'c-tooltip',
  'c-tree-select',
];
