---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A hovered `c-side-navigation-item` keeps its white label at WCAG AA contrast in
light mode: the hover fill (`--c-nav-surface-hover`) darkens instead of
lightening. The label read 4.25:1 before.
