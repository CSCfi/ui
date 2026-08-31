---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-autocomplete`'s in-panel search input now shows a magnifying-glass icon
in front of the input as a "type to filter" affordance. The glyph is
decorative (hidden from assistive technology) and inherits its color from
the search row, so `::part(search)` color overrides apply to it as well.
The options list also gained a small gap below the search row's divider.
