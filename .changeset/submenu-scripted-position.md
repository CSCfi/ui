---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In Safari, an open `c-menu-item` submenu no longer drifts away from its row
when the page scrolls. Submenus are now positioned by script in every browser,
as they already were where CSS anchor positioning is missing.
