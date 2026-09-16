---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-link` hovers with the `link-subtle` tint. It painted the `link-hover` role,
which is the hover *ink* — in dark mode a lighter step than the link text, so
hovered links were unreadable (1.6:1).
