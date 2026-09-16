---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-pagination` keeps the range text ("1 - 10 of 100 items") at the right edge
beside the items-per-page control while both fit and puts it flush under the
control on its own row when the viewport is too narrow. A fixed right-aligned
box used to leave it indented at a width-dependent offset, and wrapped rows
had no gap between them.
