---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-menu` submenus open on tap on iOS. A click on a parent item toggled its
submenu, so whenever the submenu was open — or merely recorded as open — by
the time the tap's delayed `click` arrived, the tap closed it and nothing ever
showed. A click on a parent item now only ever opens its submenu and moves
into it; the record of open submenus follows the panel's real popover state,
hover-open is reserved for mouse and pen pointers, and on a narrow viewport,
where neither side of the row has room, the submenu drops below (or above)
its row instead of rendering off screen.
