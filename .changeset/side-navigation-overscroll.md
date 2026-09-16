---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A pinned `c-side-navigation` that scrolls on its own (the `autoheight` state
and the desktop drawer inside `c-main`) contains its overscroll: a wheel or
swipe that reached the drawer's end chained to the document, and the browser
then kept scrolling the page for the rest of the gesture while the drawer
could not be scrolled back. The drawer is also sized to the visible viewport
(`dvh`) so it fits while a phone's browser chrome is expanded.
