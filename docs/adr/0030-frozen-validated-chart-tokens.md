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

## Amendment — 2026-09-03: twelve single hues, no shade pairs

The original set was five hue pairs (a dark shade plus a light shade) and two
singles, which parked most slots just above the 0.10 chroma floor and left
four dark-mode slots below 3:1. It read flat, and the dark shades (slots 2,
3, 4) read too dark. The set was re-derived under a different structure:

- **Twelve single hues.** No slot is a shade of another. Every slot sits at
  OKLCH L 0.55–0.67 (light) / 0.58–0.67 (dark), so all twelve clear 3:1 on
  their chart surface in both modes — **no relief slots remain**.
- **Slots 1–7 keep their hue identities** (blue, magenta, gold, purple, teal,
  rose, cyan; each within 6° of the previous hue), so charts with seven or
  fewer series keep the colours people know. Slots 1/2/5 stay on the
  info/secondary/accent hues but no longer coincide with ramp steps (chroma
  is higher than any ramp step at that lightness). **Slots 8–12 are new
  viz-only hues**: indigo, orchid, olive, violet, aqua.
- **Chroma to the gamut, under ceilings.** Blue/gold/teal/cyan are capped by
  sRGB at these lightnesses; magenta, purple, rose and the yellows get
  explicit ceilings so the set stays rich rather than neon.
- **Status hue bands excluded** (reds and oranges for error/warning, greens
  for success), so no series impersonates a status colour; the set leans
  cool as a result, which is the brand's side of the wheel.
- **Hues were fixed by construction, not searched.** Free-hue optimisation
  collapses into a cluster of blues; only lightness, chroma and the order of
  slots 8–12 were optimised against the validator.

Validated as a set with the dataviz validator: light clears adjacent CVD
ΔE 10.2 / normal 17.9, dark 8.7 / 16.9 (both above the 8 / 15 gates; the
normal-vision margin is smaller than the paired set's 20.1 because separation
now comes from hue alone). The all-pairs (scatter/map) safe prefix is
unchanged at slots 1–3. Everything else in this ADR — frozen literals, slot
order as API, anatomy roles, the escape hatch — stands.
