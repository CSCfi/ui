---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Publish the chart tokens as importable data (ADR-0040), so canvas charts no
longer scrape `--c-chart-*` from the document.

- `chartSlots` and `chartAnatomy`: the twelve series slots and the chart
  anatomy roles (`surface`, `grid`, `axis`) per theme mode, as `oklch()`
  strings — the palette's own colour space, ready for CSS, SVG and canvas.
- `chartSlotsHex` and `chartAnatomyHex`: the same colours as `#rrggbb`, for
  chart libraries that do their own colour maths in sRGB (ECharts, Chart.js)
  and cannot parse `oklch()`.
- `themeMode()`: resolves the mode on screen by the same cascade tokens.css
  uses (explicit `data-theme` wins, else the OS preference; light on the
  server).

The data is generated from the semantic token maps at build time and guarded
by a parity lint, and it always reports the frozen, validated set — it never
follows a consumer's `--c-chart-*` overrides. Re-exported from
`@cscfi/csc-ui-react`.
