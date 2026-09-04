---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-button-group` and `c-tab-buttons` now read on every surface (ADR-0042).
Their track was drawn only by an opaque fill, which disappeared on the page
canvas, on `surface-muted`, and on dark-mode cards. The track keeps its fill
and gains a 1px hairline frame painted with the `divider` token, so the
control is visible wherever it is placed. The height is unchanged: the frame
replaces 1px of the inner padding. The `root` part of both components now
carries a border; `::part(root)` overrides of `background` are unaffected.
