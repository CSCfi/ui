A single command in a `c-menu`.

Put a leading icon in the `icon` slot (`<c-icon slot="icon" path="…">`). For
a set of choices, give each item `type="radio"` and mark the current one
`checked`: it shows a check mark and `aria-checked`. The menu only fires
`select`; checking the item is yours to do.

## Scrolling

A long submenu scrolls like the menu itself: no scrollbar, and a half-visible
item as the cue that more follow. Restore the scrollbar with
`c-menu-item::part(submenu-list) { scrollbar-width: auto; }`.
