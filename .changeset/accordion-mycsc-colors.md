---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Recolour c-accordion-item per the MyCSC accordion spec (colours only — no
geometry changes).

- Header keeps its `primary-subtle` fill and gains a `primary-subtle-hover`
  hairline border plus a hover state on the same tone, so hovering closes
  the fill/border gap (teal-tinted header with a lighter teal outline in
  dark mode, near-invisible on the light tint).
- Heading text uses `on-surface` (near-white in dark, deep navy-teal in
  light — the spec's headings role); the icon slot and chevron use
  `on-primary-subtle`; slotted content uses `on-surface-muted` instead of
  inheriting the page colour.
