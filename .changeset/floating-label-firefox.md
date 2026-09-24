---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix the floating label disappearing in Firefox 140 ESR once a field is focused
or filled. The label lifted onto the field border in `c-text-field`,
`c-select`, `c-autocomplete` and `c-tree-select` (and any bare `c-input`)
painted nothing there; it now shows in every browser, with the same look and
the same ellipsis for a long label.
