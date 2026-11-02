---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

An `aria-label` (and any other ARIA attribute) on `c-checkbox`, `c-switch`,
`c-radio` or `c-progress-bar` reaches the native control inside: it used to
land on a wrapper or be dropped, leaving the control unnamed. Every other
attribute stays where it was.
