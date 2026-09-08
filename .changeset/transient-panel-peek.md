---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-menu`, its submenus and `c-select` now hide the list scrollbar, as
`c-autocomplete` already did (ADR-0043). In its place an overflowing panel
always ends on a half-visible row — the peek — so it is clear that more items
follow. `items-per-page` keeps meaning that many full rows before the peek, and
menus cap at the viewport. The cap is now measured from the real rows, so
taller `c-option` rows and menus mixing items with labels and dividers cut
correctly. Restore the scrollbar with `scrollbar-width: auto` on
`c-select::part(list)`, `c-autocomplete::part(list)`, `c-menu::part(list)` or
`c-menu-item::part(submenu)`.
