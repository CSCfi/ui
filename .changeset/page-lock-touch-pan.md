---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Stop the fullscreen panels of `c-autocomplete`, `c-tree-select` and `c-select`
flickering on iOS when a short list is dragged. With the on-screen keyboard
up, iOS Safari pans the visual viewport on any single-finger drag the page
did not consume, and the panel content that follows the visual viewport to
stay above the keyboard jumped after every pan. While the shared page lock is
held, a single-touch drag with no scrollable list in its path is cancelled; a
drag inside an overflowing list still scrolls it.
