---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-slider` fixes:

- The tick marks, their numbers and the filled marks start at `min`; they
  used to assume a range starting at 0.
- A value outside `min`..`max`, such as the built-in 50 on a slider with
  `max="8"`, is shown at the end of the range instead of past it.
- The value bubble and the mark numbers follow the page's `lang` (they were
  always Finnish) and show as many decimals as `step` has (they were always
  rounded to whole numbers).
