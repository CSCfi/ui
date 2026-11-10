---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`focus()` on a `c-button` or `c-icon-button` now focuses its button (its
link, or the slotted button), as on a native button. It did nothing, so a
`c-menu` closed from one of them left focus on the page instead of on the
trigger.
