---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Value-selection fields open a fullscreen panel on narrow viewports. Below
760px, `c-autocomplete` and `c-tree-select` no longer anchor their panel under
the field: it covers the viewport with a heading row (the field's label and a
close button), the search input pinned beneath it and the options filling the
rest, following the on-screen keyboard so the search stays visible. The page
behind the panel is inert until it closes. `c-select`'s existing phone layout
now covers the whole viewport (no gaps below the small viewport or at the
corners), follows the keyboard the same way and gains the same heading row.
The close button's label is the new `closePanel` text; the row exposes the
`heading-row`, `heading` and `close` parts.

Transient panels (`c-menu`, `c-popover`, `c-autocomplete`, `c-tree-select`) no
longer close when a scroll or drag gesture starts outside them: light dismiss
now needs the press and its release both outside, as for a native popover.
