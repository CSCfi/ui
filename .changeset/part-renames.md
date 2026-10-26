---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Parts renamed to the library's vocabulary, so a `::part()` rule reads the
same across components:

- A list row is `option` on `c-select`, `c-autocomplete` and
  `c-tree-select` (was `item`), as on the pickers.
- `c-select`'s panel is `panel` and `card` (was `menu`), as on the other
  value fields: a `::part(card)` rule now styles every field's panel.
- `c-checkbox`: the label text is `label`, as on `c-switch` (was
  `content`); the row around box and text has no part.
- `c-color-picker`: `color-chip` → `value-color`.
- `c-login-button`: `title` → `label`.
- `c-menu-item`: `submenu` → `submenu-list`, beside `submenu-panel`.
- `c-side-navigation-title`: `label` → `heading`.
- `c-time-picker`: `end-tab` → `end`.
