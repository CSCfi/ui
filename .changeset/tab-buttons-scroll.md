---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tab-buttons` scrolls sideways when the strip is wider than its box instead
of letting the buttons overlap: a single row inside a native scroller with a
hidden scrollbar, edge arrows (new `scroll-back` / `scroll-forward` parts)
while it overflows, mouse drag and wheel scrolling, and the active tab is
scrolled into view when `c-tabs` changes it. The sliding indicator follows the
buttons through the scroller.
