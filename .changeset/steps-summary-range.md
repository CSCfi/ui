---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-steps`' screen-reader summary stays within the steps: a `value` of 0 no
longer reads "step 0" and "-1 steps marked as completed", an empty step label
leaves no stray full stop, and the label's surrounding whitespace is dropped.
