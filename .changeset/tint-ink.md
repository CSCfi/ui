---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Highlighted rows and hovered controls meet WCAG AA contrast in dark mode.
Where a component tints its background with primary on hover, focus or
selection, its text now takes the tint's ink (`--c-on-primary-subtle`) instead
of primary, which read 3.7:1. This covers the active option in `c-select`,
`c-autocomplete` and `c-tree-select`, a hovered `c-menu-item`, the pickers'
hovered and selected cells, a hovered `c-accordion-item` header, breadcrumb
links, a sortable `c-data-table` header, `c-file-upload`'s choose button,
`c-card`'s fullscreen button and a hovered `c-link`.
