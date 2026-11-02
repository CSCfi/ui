---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In browsers without CSS anchor positioning, an open `c-menu-item` submenu
could stay where it opened when the page scrolled, apart from its menu. It now
follows its menu.
