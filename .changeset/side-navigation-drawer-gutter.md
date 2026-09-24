---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix the closed mobile `c-side-navigation` drawer showing as a strip at the
right edge of the screen on a page with `scrollbar-gutter: stable`. The drawer
was only slid off-screen, which left it in the reserved gutter; it is now also
hidden once closed, which takes its links out of the tab order too. The
slide-in and slide-out animations are unchanged.
