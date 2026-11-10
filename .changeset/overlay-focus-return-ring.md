---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Picking a `c-menu` item or pressing Escape returns focus to the menu's
trigger with its focus ring when a key closed the menu, in Firefox and Safari
too; a mouse pick leaves no ring. Escape from inside a `c-popover` returns
focus to its trigger the same way, a `c-button` or `c-icon-button` trigger
included.
