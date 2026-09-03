---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Re-derive the twelve chart series slots (`--c-chart-1` … `--c-chart-12`) as
vivid single hues (ADR-0030, amended).

- The previous set was five dark/light shade pairs plus two singles, parked
  just above the chroma floor; it read flat, and the dark shades read too
  dark. The new set is twelve single hues at a mid lightness (OKLCH L
  0.55–0.67 light, 0.58–0.67 dark) with chroma pushed to the sRGB gamut under
  per-hue ceilings.
- Slots 1–7 keep their hue identities (blue, magenta, gold, purple, teal,
  rose, cyan) so charts with up to seven series keep familiar colours; slots
  8–12 are new hues (indigo, orchid, olive, violet, aqua). Status hue bands
  (reds, oranges, greens) are excluded.
- Every slot now clears 3:1 on both chart surfaces — the four dark-mode
  relief slots are gone. The all-pairs safe prefix for scatter/bubble/map
  forms stays at slots 1–3.
- Validated as a set with the dataviz validator: adjacent-pair CVD ΔE 10.2
  (light) / 8.7 (dark), normal-vision floor 17.9 / 16.9.

Chart tokens are frozen literals, so this does not interact with
`applyTheme`; consumers who override `--c-chart-*` are unaffected.
