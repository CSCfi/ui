---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-data-table` with `autohide` measures its columns at their natural widths.
It measured them from the already-squeezed `width: 100%` layout, so in a box
narrower than the content the total always equalled the box, nothing was
hidden, and the table scrolled sideways instead of moving columns into the
expansion row.
