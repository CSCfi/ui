---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Align c-card and c-card-title with the MyCSC card anatomy.

- `c-card` now draws a hairline `border`-token outline and a single soft
  drop shadow (`0 2px 8px rgba(0,0,0,.25)`) instead of the heavy two-layer
  shadow — elevation reads from the surface + border, matching the design
  spec in both modes.
- Card sections get the spec's 24px/28px padding rhythm: a new
  `--_c-card-padding-inline` host contract (28px at desktop) drives the
  inline padding of c-card-title / c-card-content / c-card-actions, while
  `--_c-card-gap` keeps owning block padding and section gaps.
- `c-card-title` follows the spec's section-title anatomy: 13.5px/700
  uppercase with 1.2px tracking, `on-surface` heading colour (the spec's
  headings role), and a 42×3px rounded `primary` accent bar 8px below.
