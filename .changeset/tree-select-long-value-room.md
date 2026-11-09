---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tree-select` shows a long value whole where the page has room. In a
layout that sizes the field from its content, the field still takes the
width of a `c-select` and grows past it only for a value that needs more,
never past its container.
