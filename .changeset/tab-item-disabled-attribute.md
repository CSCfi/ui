---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A `c-tab-item` carrying a `disabled` attribute no longer collapses to zero
width. The attribute was never part of the panel's API, a 3.x leftover, and a
selected panel carrying it showed nothing. To keep a tab from being selected,
set `disabled` on its `c-tab`.
