---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A `c-modal`, or any other `position: fixed` content, inside a `c-tab-item`
covers the viewport again: the tab set used to position and clip it inside the
panel. The panels now slide only while switching and sit without a transform
otherwise.
