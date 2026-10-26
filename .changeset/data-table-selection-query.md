---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-data-table`:

- `change:selected` carries the selected ids, `string[]` — the new
  `selected`, as a value event carries its value. The selected row objects
  are the new read-only `selectedRows` property.
- `filter` (the client-side search string) is renamed `query`, so it no longer
  shares its name with `c-autocomplete`'s and `c-tree-select`'s `filter`
  predicate.
