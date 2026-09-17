---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tree-select` centres the committed value in its field and never truncates
its code. The two-line value block sat 10px from the top and 6px from the
bottom, so both a path-and-label value and a single-line root value read as
bottom-heavy; the block is now centred with even padding. The code kept
ellipsising along with the label; it is the item's identity, so it now keeps
its full width and only the label beside it truncates.
