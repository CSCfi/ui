---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tree-select` keeps the width of a `c-select` when the page sizes the field
from its content (a flex row, a column aligned to the start), empty or
holding any value. It was as narrow as its chevron while empty and changed
width with each pick.
