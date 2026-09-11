---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add app-wide prop defaults (ADR-0048): `applyDefaults()` sets a preference
prop once for every instance of a tag, and `resetDefaults()` clears it.

- `applyDefaults({ 'c-text-field': { labelOnTop: true } })` makes every text
  field label on top; `applyDefaults({ 'c-select': { texts } })` translates
  every select in one call. Later calls merge with earlier ones, a key set to
  `undefined` clears it, and mounted elements follow live — a locale switch is
  one call.
- Only defaultable props take part, badged "app default" in each component's
  Properties table and typed as `AppDefaults`: `labelOnTop`, `hideDetails`,
  `shadow` and `size` on c-text-field, c-select, c-autocomplete and
  c-tree-select; `itemsPerPage` on the three list fields; `texts` on those
  three and c-data-table. An unknown tag or prop throws.
- An explicit attribute or property on an instance always wins over the app
  default; `texts` merges key by key over the built-in strings. Both functions
  are re-exported from `@cscfi/csc-ui-react`.

Two visible changes for these props: when unset, the element property now
reads `undefined` instead of the built-in (`el.labelOnTop`, `el.size`,
`el.itemsPerPage`), and the host no longer carries the reflected default
attributes `size="default"` / `items-per-page="6"`.
