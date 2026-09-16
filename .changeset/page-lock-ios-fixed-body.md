---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix the page scroll lock on iOS: the shared lock behind `c-modal` and the
fullscreen panels of `c-autocomplete`, `c-tree-select` and `c-select` only set
`overflow: hidden` on the document, which iOS Safari ignores for touch panning,
so swiping through the options scrolled the page underneath. The lock now also
takes the body out of the scroll flow at its current offset and restores that
offset on release, so nothing visibly moves. `c-select`'s listbox drops its
private body-overflow lock and holds the shared one.
