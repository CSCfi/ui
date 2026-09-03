---
status: accepted
---

# Chart slots are published as OKLCH data with a hex twin

The twelve **series slots** and the chart anatomy roles (ADR-0030) are also
exported from the package entry as typed data — `chartSlots` /
`chartAnatomy` as `oklch()` strings and `chartSlotsHex` / `chartAnatomyHex`
as `#rrggbb` — each keyed by **theme mode**, alongside a `themeMode()`
resolver that mirrors the CSS cascade (explicit `data-theme` wins, else the
OS preference). Canvas renderers cannot read CSS custom properties, and the
documented alternative — scraping `--c-chart-*` with `getComputedStyle` and
re-reading on theme change — was boilerplate every consumer copied.

## Decisions

- **OKLCH is the primary format.** The palette is authored perceptually
  (ADR-0011) and OKLCH is what a consumer needs to derive washes and tints
  in the same space. Four decimals are used because that precision round-
  trips every shipped slot to its exact sRGB hex; the generator asserts this
  at build time.
- **A hex twin ships beside it, as data, not a helper.** ECharts (zrender)
  and Chart.js (`@kurkle/color`) parse only hex/rgb/hsl inside their own
  colour maths, so an `oklch()` string paints a bar but breaks hover and
  emphasis derivation. Duplicating 30 strings is cheaper than pulling colour
  conversion into every consumer's bundle or asking them to add culori.
- **The export reports the frozen set, never the document.** A consumer who
  overrides `--c-chart-*` has taken ownership of their palette (ADR-0030's
  escape hatch) and owns its array too; following the DOM would reintroduce
  exactly the scraping this removes and break server rendering.
- **Generated, never hand-edited.** The TS module is derived from
  `tokens/semantic/{light,dark}.json` by a build script with a parity lint,
  the same shape as the ramp core's guard (ADR-0011), so the CSS variable
  and the exported value cannot drift.

## Considered options

- **Function that resolves computed styles** (follows overrides): DOM-only,
  wrong on the server, and it is the status quo with a wrapper. Rejected.
- **`{ hex, l, c, h }` objects per slot**: one export serves both needs, but
  index access becomes `.hex` and the ergonomics for the common case
  (hand an array to a chart library) get worse. Rejected in favour of two
  parallel tuples with identical shape.
- **Switching the CSS tokens themselves to OKLCH** for byte parity: touches
  style-dictionary output, the contrast audit and the ramp parity check for
  no consumer benefit. Not pursued; the round-trip assertion gives the same
  guarantee.
