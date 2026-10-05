---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

c-date-picker and c-time-picker now ring the panel's focused day or row after
Alt+↓ and the arrow keys, also when the field was clicked first and in Firefox,
where no ring showed. A selected day rings in its own ink, inside the fill,
instead of a primary ring lost against it.
