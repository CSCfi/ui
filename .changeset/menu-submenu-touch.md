---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-menu` submenus open on tap in Safari and iOS. A touch fires `pointerover`
before its `click`; the hover-open that `pointerover` started had the submenu
open by the time the click arrived, and the click toggled it straight back
shut, so the submenu flashed and vanished. Touch no longer hover-opens — a
tap on the item toggles its submenu — and the submenu panel now flips to the
other side or below when there is no room to the right.
