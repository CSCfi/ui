---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-card` fixes for `fullscreen` cards:

- `c-card-title` keeps its text and `actions` clear of the fullscreen toggle,
  which used to cover the last 32px of the actions.
- `exitFullscreen()` and the toggle end only the card's own fullscreen; they
  used to end whatever element was fullscreen.
