---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In Firefox, the dash between the start and end of a `range` `c-date-picker` or
`c-time-picker` now sits evenly between the two values. The start was as wide
as its character count, which left a wider gap before the dash than after it.
