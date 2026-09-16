---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-card-title`'s `actions` slot drops onto its own row under the title,
starting at the left edge, when the two do not fit side by side; it stayed
right-aligned (and stacked its own rows in reverse) after wrapping.
`c-card-actions` wraps a footer row longer than the card instead of
overflowing it.
