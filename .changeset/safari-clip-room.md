---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In Safari, a `c-badge` on a `c-tab` is no longer cut off, the floating label
of `c-text-field`, `c-select` and the other fields keeps room for tall glyphs,
and `c-breadcrumb` no longer cuts the focus rings of its crumbs. They relied
on CSS `overflow-clip-margin`, which Safari does not support.
