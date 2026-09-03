---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Emit every colour token as `oklch()` (ADR-0041).

All `--c-*` custom properties in `tokens.css` — palette steps, semantic
roles' literal values (chart slots, logo marks) — and the ramps written by
`applyTheme` / `themeToCss` are now `oklch(L C H)` strings instead of
`#rrggbbff`. Colours are unchanged: each value is converted from the same
validated hex at a precision that round-trips exactly, and the build's ramp
parity check compares tokens.css and the runtime output byte for byte. The
`--c-<family>-rgb` compositing triples stay numeric.

Requires a browser with `oklch()` support (Chrome 111, Safari 15.4, Firefox
113 and later), which the library's custom-element and Tailwind v4 baseline
already implies. Consumers who read `--c-*` back and parsed hex should use
the exported chart data (`chartSlotsHex`) or the `-rgb` triples instead.
