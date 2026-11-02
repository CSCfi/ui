---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-pagination` ends the last page's `endTo` at the last item instead of a full
page further, and no longer puts the element's classes (or the 3.x
`c-pagination`, `c-pagination--small` and `c-pagination--simple` classes it
added itself) on its inner `<nav>`. An `aria-label` on the element still names
the navigation.
