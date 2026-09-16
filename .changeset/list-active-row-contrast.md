---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-list-item`'s active row uses the `on-primary-subtle` ink paired with its
`primary-subtle` tint and adds the 1px inset `primary` ring the other row
components paint; the hover step carries the `on-surface` ink. `primary` on
the tint fell short of AA in dark mode and the muted ink on the hover step in
both modes. `c-select`'s selected option row takes the same paired ink.
