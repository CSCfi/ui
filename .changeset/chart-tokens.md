---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add a validated dataviz palette as semantic chart tokens: twelve categorical
series slots (`--c-chart-1` … `--c-chart-12`) plus chart anatomy roles
(`--c-chart-surface`, `--c-chart-grid`, `--c-chart-axis`), in light and dark
mode, exposed in the Tailwind theme export as `chart-*` color roles.

- The 12 slots pass the computable accessibility checks as a set, per mode,
  against the chart surface (which equals the raised card surface): CVD
  separation on adjacent pairs, a normal-vision separation floor, OKLCH
  lightness band and chroma floor, and contrast (with documented dark-mode
  relief slots).
- Series slots are frozen viz-owned values (ADR-0030): `applyTheme`
  re-seeding re-themes components but never charts, so the validated
  guarantee cannot be silently broken. Override `--c-chart-*` directly to
  opt out and own re-validation.
- Slot order is part of the contract: assign series in slot order, never
  cycle or re-rank; scatter/bubble/map forms cap at slots 1–3.
- New docs guide "Data visualization" documents the palette and shows
  dependency-free SVG bar and line charts on a `c-card`.
