---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-spinner` and `c-loader` have a `thickness` attribute for the stroke width
in pixels, the name `c-progress-circle` already uses. It replaces `width`,
which is deprecated and keeps working until 5.0; `thickness` wins when both
are set.
