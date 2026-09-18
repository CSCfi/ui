---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

One shared control height of 52px (ADR-0055). The `default` field box of
`c-input` — behind `c-text-field`, `c-select`, `c-autocomplete` and
`c-tree-select` — grows from 44px to 52px, held in the new `--spacing-control`
theme value together with the `default` `c-button` (52px, from 44px), the
`c-button-group` frame (52px, its buttons 44px inside) and `c-tab` (52px, as
before). `c-tree-select` no longer grows on selection: its two-line path and
label value fits the box. The button scale becomes 28 / 52 / 60: `large` rises
to the toolbar height so it stays a step above `default`; `small` buttons and
`small` fields are unchanged. Layouts aligned to the old 44px need to follow.
