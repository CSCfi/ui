---
status: accepted
---

# Token values are emitted as `oklch()`

Every colour the library writes as a CSS value — the palette and semantic
`--c-*` custom properties in `tokens.css`, the literal chart slots and logo
marks, and the ramps `applyTheme` / `themeToCss` emit at runtime — is written
as `oklch(L C H)` rather than `#rrggbbff`. The ramps are still *computed* and
*validated* as sRGB hex (`base.json`, the contrast audit, the dataviz
validator); a single `cssColor()` in the ramp core converts at emission time,
at the smallest precision from four decimals that round-trips to exactly the
validated hex, so the emitted colour is the audited colour and not a
neighbour of it. Both emitters share that function, and the ramp parity
check compares them byte for byte.

## Why

- The palette is authored perceptually (ADR-0011) and the chart data is
  published in OKLCH (ADR-0040); emitting the variables in the same space
  makes `var(--c-primary-500)` and `chartSlots.light[0]` literally the same
  string, and lets consumers derive tints with `oklch(from var(--c-…) …)`
  without converting first.
- The `--c-<family>-rgb` compositing triples stay as `r, g, b` numbers: they
  are not colours but ingredients for `rgb(var(--c-primary-rgb) / a)`.

## Consequences

- **Browser floor moves to 2023.** `oklch()` is supported from Chrome 111,
  Safari 15.4 and Firefox 113. An older browser treats a custom property
  holding `oklch()` as invalid at use time, so text on it falls back to the
  inherited colour rather than the token. The library already requires
  evergreen browsers for custom elements and Tailwind v4 (`@property`,
  `color-mix()`), so no supported browser is lost.
- Consumers who scraped `--c-*` and parsed hex (the pattern ADR-0040
  replaces) now receive `oklch()` strings; `chartSlotsHex` covers the chart
  case, and `--c-<family>-rgb` the compositing case.
- Building `tokens.css` needs Node ≥ 22.12: the CommonJS token pipeline loads
  the ESM ramp core through `require(esm)` so there is exactly one converter.
