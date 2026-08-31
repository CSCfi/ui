---
status: accepted
---

# Dark-mode interactive roles derive from their own family, not the accent ramp

The dark-mode retune to the approved MyCSC dark theme v2 spec originally
mapped the bright interactive roles — the `primary` fill pair, `link`,
`ring` — onto **accent-family** steps (`accent-500/400/300`), because those
land almost exactly on the spec's vivid teals (#3BB8B0/#56CFC8/#8AE0DA)
while the primary ramp's light steps are chroma-tapered and read washed on
dark surfaces. We reverse that borrowing: every interactive role now
resolves to lightened steps of **its own family** (`primary` → primary-300,
`primary-hover` → primary-200, `on-primary-subtle` → primary-200, `ring` →
primary-300, `link` → link-200, `link-hover` → link-100), the same shape the
status families already follow.

## Context

ADR-0011's consumer-theming contract promises that supplying one seed per
family regenerates the whole ramp "and every semantic token that resolves to
it, in both modes". The accent borrowing silently broke that for dark mode:
`applyTheme({ primary })` re-themed dark nav chrome and subtle fills (still
on primary steps) but left every primary button, link, and focus ring on the
untouched accent ramp — a consumer rebranding `primary` saw only the side
navigation change. Surfaced by the docs ColorSwitcher, which demonstrates
exactly this API.

## Decision

Per-family re-theming wins over spec-exact dark colors. The default dark
interactive look changes from the vivid CSC accent teal to the lightened
petrol of the primary ramp (and links to the link family's steel-blue) — a
deliberate deviation from the approved dark v2 spec's colors, keeping its
structure (lighten-on-hover, dark ink on bright fills, the retuned neutral
surfaces) intact. A brand that wants the vivid dark teal back can have it
correctly through the API this preserves: re-seed `primary` with a brighter
color, rather than the library hard-wiring one family to another.

All affected pairs re-validated with `scripts/audit-contrast.mjs`: the dark
mode passes every text pair at AA and every non-text pair at 3:1 with
comfortable margins (`on-primary`/`primary` 6.31:1, `link`/`surface` 5.33:1,
`ring`/`surface` 6.54:1).

## Consequences

- `applyTheme` / `themeToCss` re-theme each family symmetrically in both
  modes again; no cross-family coupling in the dark map for interactive
  roles.
- Dark link steps had to climb to `link-200/100` (the link seed is a deep
  navy whose 300 step only reaches 3.13:1 on the dark surface — below AA
  text).
- Light mode still maps `link-hover`/`link-subtle-hover` to `accent-100`;
  that pre-existing cross-family reference is out of this decision's scope
  and would need the same treatment if link re-theming fidelity ever
  matters there.
