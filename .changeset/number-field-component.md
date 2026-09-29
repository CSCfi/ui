---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add `c-number-field`: a number input that shows thousands separators as the
user types (`1 234 567,89`) while its value stays a plain number. The
separators follow the page language unless set, `decimals` allows fraction
digits (with optional padding), and `min` / `max` report an out-of-range
number through the `out-of-range` custom state instead of changing it.
