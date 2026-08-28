---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix c-accordion-item header text color inconsistency: content in the `header`
slot inherited the icon/chevron accent tone instead of the heading color, so
a slotted header rendered a different color than the `heading` prop (teal vs
white in dark mode). The header button now sets the text color on itself so
both paths render identically, and the icon/indicator accents are set
explicitly rather than via `currentColor`.
