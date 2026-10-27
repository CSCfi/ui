---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

ARIA attributes set on a component now reach its inner element under their
own names. Before, an attribute whose DOM property is not spelled like its
name arrived mangled: `aria-haspopup` on `c-icon-button` (and on the date,
time and colour pickers' buttons) became a meaningless `ariahaspopup`, and
`aria-label` on `c-icon` never named the icon. A `c-icon` with an
`aria-label` is now an image with that name, and `c-link` forwards ARIA
attributes and `rel`, `download`, `hreflang`, `ping`, `referrerpolicy` and
`type` to its link.
