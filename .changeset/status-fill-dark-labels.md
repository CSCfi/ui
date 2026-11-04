---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In light mode, text on the success, info and warning fills is dark instead of
white, so it meets WCAG AA contrast: `--c-on-success`, `--c-on-info` and
`--c-on-warning` changed. This fixes the count on `c-badge` and on a
`c-icon-button` badge, which read at 3.2:1.
