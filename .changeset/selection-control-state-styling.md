---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Selection controls are now stylable per state from consumer CSS (ADR-0035).
`c-checkbox`, `c-radio` and `c-switch` expose their interaction state as
custom states (`c-checkbox:state(checked)`, `:state(indeterminate)`,
`c-radio:state(checked)`, `:state(disabled)`, `c-switch:state(checked)`),
and the `indicator` part now targets the actual visual control — the
checkbox box (with the new `mark` part for the check glyph) and the radio
ring (its dot is the ring's `::after`) — so rules like
`c-checkbox:state(checked)::part(indicator) { background: green }` work.

BREAKING: `::part(indicator)` no longer targets the circular ripple/hover
surface on `c-checkbox`/`c-radio`; that surface is internal and no longer
stylable. Also fixes the indeterminate checkbox never filling its box.
