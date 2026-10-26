---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-side-navigation`'s `menu-visible` is renamed `open`, and
`change:menu-visible` is `change:open` (`onChangeOpen` in React). It now fires
whenever the user opens or closes the drawer: a `c-navigation-button`, the
close button, the backdrop, or activating an item, which closes the drawer.
Enter on a `c-navigation-button` opens the drawer again; it used to toggle it
twice.

Inline-style props are removed (ADR-0006): `c-side-navigation`'s `styles` and
`c-link`'s `weight`. Restyle through `::part()`, e.g.
`c-link::part(root) { font-weight: 400; }`.
