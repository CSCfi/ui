---
status: accepted
---

# Chart tokens are frozen, viz-owned values that theming cannot move

The library ships a categorical dataviz palette as semantic tokens — twelve
**series slots** (`--c-chart-1` … `--c-chart-12`) plus the chart anatomy roles
(`--c-chart-surface`, `--c-chart-grid`, `--c-chart-axis`). The series slots are
**literal hex values per mode** in the semantic maps, not `var()` references
into the family ramps, so consumer re-seeding via `applyTheme` (ADR-0011)
re-themes components but deliberately never charts.

## Context

The chart palette's entire value is a guarantee: the 12 slots, in slot order,
pass the computable accessibility checks *as a set* in both modes against the
chart surface — CVD separation (protan/deutan ΔE ≥ 8 on adjacent pairs,
Machado 2009 severity 1.0), a normal-vision floor (ΔE ≥ 15), an OKLCH
lightness band and chroma floor per mode, and WCAG contrast against
`chart-surface` (with documented sub-3:1 relief slots in dark mode). The set
was derived by enumeration (720 hue orders × shade rotations, maximized
minimum adjacent CVD ΔE), not picked by eye: light clears ΔE 8.4 / 20.1
normal, dark 10.0 / 20.1.

Five slots coincide with existing brand ramp steps (`info-600/500/400`,
`secondary-400/300`, `accent-600`); the other seven are minted viz-only hues
(gold, purple, rose, cyan) the brand ramps lack — the existing families offer
only three usable hue regions (`primary`/`link` fail the chroma floor,
`success`/`warning`/`error` are reserved status meanings), and sRGB gamut
physically caps teal below the chroma floor for L < 0.6, so teal can never
form a dark-mode shade pair (hence 5 paired hues + 2 singles, not 6 pairs).

If the slots referenced family steps, re-seeding `info` or `secondary` would
silently move five slots — colliding with the minted hues (re-seed `info` to
purple and slots 1/9 impersonate slots 4/12) and voiding every validated
guarantee with no error, precisely the failure mode the palette exists to
prevent.

## Decisions

- **Series slots are frozen literals** in `tokens/semantic/{light,dark}.json`
  (the same mechanism as the fixed logo brand marks). Validation is the
  contract; a rebrand keeps accessible charts in CSC colors rather than
  brand-colored charts with unknown accessibility.
- **Slot order is API.** Assignment is in slot sequence, never cycled, never
  skipped, never re-ranked on filtering — adjacent-pair CVD safety depends on
  the order. Scatter/bubble/map (all-pairs) forms are documented to cap at
  slots 1–3.
- **Anatomy roles track the neutral steps** (`white`/`tertiary` light,
  `slate` dark) via normal step references — those ramps are hand-tuned and
  not consumer-seedable (ADR-0011), so they are effectively frozen already,
  and the chart stays flush with `surface-raised` on cards.
- **Escape hatch:** a consumer who truly wants branded charts overrides
  `--c-chart-*` directly and owns re-validation; the docs guide names the
  obligation.

## Considered options

- **Tracking (`var()` into family ramps):** brand-coherent after re-seed, but
  silently unsafe — the one property the feature exists to guarantee. Rejected.
- **Tracking + runtime re-validation warning:** consumer-friendly but adds a
  validation engine to the theme package for a rare event. Rejected as scope;
  the frozen contract plus manual override covers it.
- **Library-only 6 hues × 2 shades (using status ramps):** satisfies "from the
  library" literally with zero minted colors, but green/orange/red series read
  as good/warning/bad next to any status UI. Rejected.
