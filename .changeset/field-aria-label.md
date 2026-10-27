---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

An `aria-label` on a field names its input. `c-text-field`, `c-number-field`,
`c-select`, `c-autocomplete`, `c-tree-select` and `c-color-picker` without a
visible `label` (a search field, say) had an unnamed input, and the date and
time pickers read "Choose date" / "Choose time". Beside a `label`, the
`aria-label` wins, as on a native control. The element's other ARIA
attributes (such as `aria-description`) reach the input too.
