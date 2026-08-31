---
status: accepted
---

# The `divider` role is a translucent ink

Separator lines get their own semantic token, `divider`, and it is the
library's only **translucent** role: a `color-mix()` alpha ink (black @ 12%
in light mode, white @ 12% in dark) instead of an opaque palette step. It
exists because `border` — which `c-divider` painted until now — resolves in
dark mode to the same step as `surface-overlay`, making every divider inside
a menu or autocomplete panel literally invisible.

## Context

Dividers had no token of their own. `CDivider` painted `bg-border`, and
`c-autocomplete`'s search row drew the same line as `border-b border-border`.
The dark palette maps both `border` and `surface-overlay` to `slate-700`
(`#3c4247`) — contrast **1.00:1** on exactly the rung where dividers most
commonly sit (the menu family and autocomplete panels). On the other rungs
the dark hairline read 1.32:1, matching light mode's reference divider
(`tertiary-200` on white, 1.31:1), which is why the bug was invisible outside
overlays. It also contradicted the dark theme's own premise that "elevation
reads from progressively lighter surfaces + hairline borders": the hairline
vanished on the surface that needed it.

Nothing guarded this: `scripts/audit-contrast.mjs` audited no pair against
`surface-overlay` and no hairline pair at all.

Structural constraints that shaped the fix:

- The token generator (`utils/createSemanticTheme.cjs`) understood only two
  value forms — a `#hex` literal or a palette-step key wrapped as
  `var(--c-<step>)`.
- `c-table` / `c-data-table` draw their grid lines as stacked inset
  box-shadows referencing `var(--c-border)`; a translucent `border` would
  double up at shared cell edges into visible seams.

## Decisions

- **A new `divider` semantic role, not a retune of `border`.** `border`
  stays opaque and remains the role for component frames and outlines (card
  frame, toolbar edge, table grid lines); `divider` is the role for
  content-separation hairlines. This isolates the change to the two broken
  call sites and leaves ~40 `border` usages (including the seam-sensitive
  inset-shadow grids) untouched.
- **The role is named after the tag (`c-divider`), not the glossary concept
  (*Separator*).** Deliberate: consumers styling `c-divider` reach for
  `--c-divider` / the divider utility; "divider" is also the conventional
  design-system name for this role. CONTEXT.md records the exception.
- **The value is a translucent `color-mix()` ink: black @ 12% (light), white
  @ 12% (dark).** A single alpha value is the only ink that reads
  consistently on *every* surface-ladder rung — solid steps read differently
  per rung. Measured (WCAG, ink composited over the rung):

  | rung | light | dark |
  |---|---|---|
  | `surface` / `surface-raised` | 1.32:1 | 1.46:1 |
  | `surface-overlay` | 1.32:1 | 1.43:1 |
  | `surface-muted` | 1.31:1 | 1.47:1 |

  Light mode stays pixel-equivalent to the old `tertiary-200` hairline
  (1.31:1); dark reads slightly stronger, fitting the hairline-borne
  elevation model. Authored token-referencing
  (`color-mix(in srgb, var(--c-black) 12%, transparent)`), not as an 8-digit
  hex literal.
- **The generator emits functional values verbatim.** Any value containing
  `(` passes through untouched (previously only `#` literals did), so
  `color-mix()` can be authored in the semantic JSON maps.
- **The contrast audit composites translucent inks and gains a hairline
  tier.** A `color-mix`-over-transparent value resolves to `{hex, alpha}`
  and is flattened onto the paired background before the ratio is computed
  (previously such values were silently dropped). New `divider / <rung>`
  pairs across the whole ladder assert a **1.25:1 visibility floor** —
  hairlines are decorative and cannot meet the 3:1 non-text threshold by
  design; the floor exists solely so the 1.00:1 vanishing-line failure can
  never ship silently again. Hairline failures gate `--strict` alongside
  text failures.

## Considered alternatives

- **Retune `border` itself to the alpha ink** — fixes every
  border-on-overlay case at once, but shifts ~40 call sites and produces
  seam-doubling wherever grid lines are stacked translucent inset shadows
  (`c-table`, `c-data-table`). Rejected.
- **Component-local alpha utility (`bg-on-surface/12`) with no token** —
  zero pipeline change (the Tailwind alpha modifier already works via
  `@theme inline`), but the divider colour would live as repeated literals
  outside the token vocabulary, invisible to the contrast audit and to
  consumers. Rejected.
- **A solid palette step per mode** (e.g. dark `slate-500`) — keeps the
  opaque-step authoring pattern, but no single step reads consistently
  across the ladder rungs; each surface would need its own divider shade.
  Rejected.
- **8-digit hex literal (`#ffffff1f`)** — works with zero generator change,
  but hardcodes a value among step-referencing roles and the audit's hex
  parser discards the alpha, so the audit would silently report an opaque
  ratio. Rejected.

## Consequences

- `divider` is the **only translucent semantic token** — an intentional,
  documented exception to the "role → palette step per mode" pattern, not a
  precedent for casual alpha roles.
- `CDivider` paints `bg-divider`; `c-autocomplete`'s search row uses
  `border-divider`. Other separation-line candidates (e.g. `c-data-table`'s
  group row, which sits on `primary-subtle` and is not broken) stay on
  `border` until they demonstrably need the ink.
- The Tailwind theme export gains `--color-divider`, so consumers get the
  divider utilities.
- The divider ink mixes from `black`/`white`, which are not consumer
  families — re-seeding (ADR-0011) does not move it, matching every other
  neutral role.
- Amends ADR-0010: the neutral role set is now the surface ladder, `on-*`
  foregrounds, `border`, `divider`, `ring`.
