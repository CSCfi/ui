---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tree-select` keeps a long selection inside its field: the two-line value
block is clipped and a long code ellipsises like the label instead of painting
out through the field and across the clear button. In `c-select`,
`c-autocomplete` and `c-tree-select` the clear button and chevron now render in
the field's `post` slot on a real box, so they sit flush at the trailing edge
and the chevron turns while the list is open (their classes sat on a
`display: contents` host and never applied).
