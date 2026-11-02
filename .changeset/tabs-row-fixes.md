---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tabs` tab-row fixes:

- A vertical swipe that starts on an overflowing tab row scrolls the page; the
  row used to cancel every touch move.
- `disable-animation` also stops the row's own scroll from animating.
- Focus in a panel, such as a field you are typing in, stays there when the tab
  set re-measures; it used to jump to the active tab after any key press inside
  the tab set.
- A resize that lands while the active-tab underline moves is no longer
  dropped, so a row that becomes too narrow then gets its overflow arrows.
