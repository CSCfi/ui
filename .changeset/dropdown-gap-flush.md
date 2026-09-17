---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Every dropdown meets its field with the same gap: none. `c-select`'s listbox
sat flush under the field and `c-menu` opens at its `distance` (0 by default),
but `c-autocomplete` and `c-tree-select` left 8px — the anchored panel pulled
back only the field's message area, not the gap above it — and opened upward
`c-select` left 8px while the anchored panels left none. The anchored panel
now measures the field box itself, below and above (so an on-top label no
longer pushes a flipped panel up), and the upward listbox drops its padding.
