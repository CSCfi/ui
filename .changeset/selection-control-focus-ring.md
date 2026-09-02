---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

The keyboard focus ring of `c-checkbox` and `c-radio` now follows the
indicator's colour (ADR-0039). It is drawn by the `indicator` part with
`currentColor`, and the checkbox indicator's border and checked fill draw with
`currentColor` too, so one rule recolours box, dot and focus ring together:
`c-checkbox::part(indicator) { color: green }`. Ring geometry is unchanged, the
hover tint stays on the primary colour, and `c-switch` is unchanged.
