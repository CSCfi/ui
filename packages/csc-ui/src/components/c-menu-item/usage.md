A single command in a `c-menu`.

## Scrolling

A long submenu scrolls like the menu itself: no scrollbar, and a half-visible
item as the cue that more follow. Restore the scrollbar with
`c-menu-item::part(submenu) { scrollbar-width: auto; }`.
