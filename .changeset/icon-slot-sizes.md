---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-button`, `c-icon-button`, `c-menu-item`, `c-accordion-item` and
`c-breadcrumb-item` now size a slotted icon that has no `size` of its own to
match the component: 20px in a small button and 24px in other buttons, 18, 22
or 24px in an icon button, 18px in a menu item, 24px in an accordion header,
and 20px in a breadcrumb crumb (18px when folded). A `c-icon` with its own
`size` keeps it, and a plain `<svg>` or `<img>` is sized the same way.

An unsized `c-icon` still draws at 24px elsewhere, but its `size` property
now reads `undefined` and it no longer carries a `size="24"` attribute.
