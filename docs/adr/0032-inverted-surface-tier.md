---
status: accepted
---

# An inverted-surface tier tops the surface ladder; toasts leave the overlay tier

The surface ladder gains a fourth, **contrast-flipping** rung:
`surface-inverted` takes the *opposite* mode's ground — near-black
(`slate-950`) in light mode, white in dark mode — with its own foreground
inks (`on-surface-inverted`, `on-surface-inverted-muted`) and one accent ink
per status family (`success|info|warning|error-inverted`). `c-toast` moves
onto this tier as its first tenant: a borderless inverted pill whose status
is carried solely by a coloured status icon sitting in a translucent
same-colour halo circle.

## Context

The toast redesign (design mock, 2026-08-28) calls for maximum-emphasis
transient notifications that stand apart from every other surface in both
modes. The existing ladder cannot express that: `surface-overlay` climbs one
shade above the page, so a toast styled with it blends into cards and
popovers. The look the design wants is the classic inversion — a dark pill
on a light page, a white pill on a dark page — which no existing token
family provides:

- The three ladder rungs (`surface` / `surface-raised` / `surface-overlay`)
  are all near-white in light mode and progressively lighter grays in dark
  mode; none flips.
- The `inverse-*` family is **mode-invariant** by contract — "content on a
  fixed brand/dark backdrop" (hero overlays, inverted buttons), identical in
  both modes. The toast surface must do the opposite: flip *with* the mode.
- ADR-0010 forbids palette-step utilities in SFCs, so the look cannot be
  hardcoded per mode inside the component.

The status treatment on an inverted surface has the same shape: the accent
on a dark pill wants a vivid pre-anchor step (status-400), the accent on a
white pill a deeper post-anchor step (status-600) — in each mode, roughly
the *opposite* mode's accent register.

## Decisions

- **New mode-aware roles, not a redefinition.** `surface-inverted`,
  `on-surface-inverted(-muted)` and one `*-inverted` accent ink per status
  family are added to `tokens/semantic/{light,dark}.json` and the Tailwind
  theme export. The near-homonym `inverse-*` family keeps its mode-invariant
  contract untouched; the glossary separates the terms (**inverted** = flips
  with the mode, **inverse** = fixed regardless of mode).
- **One accent role per family; the halo is an alpha wash of it.** The badge
  is not a solid fill + `on-` glyph pair: the filled mdi status glyphs knock
  the symbol out of their shape, so the accent ink *is* the visible badge,
  and the halo circle is the same role at 20% over the pill. One role per
  family instead of a pair, and the halo tracks the ink by construction.
  Every pair is audited in `audit-contrast.mjs`: the neutral inks as text
  (AA 4.5), the accent inks against `surface-inverted` as non-text UI (3.0)
  — the translucent halo barely shifts the effective ground.
- **A general tier, not a toast exception.** The glossary documents
  `surface-inverted` as the ladder's top rung for maximum-emphasis transient
  layers; a future tooltip is the obvious second tenant.
- **Toast diverges from `c-alert`'s accent grammar.** The alert keeps its
  tinted wash + accent left edge (persistent, in-flow); the toast drops the
  accent border entirely (transient, overlay) — status via badge only, with
  the visually-hidden "{type} notification" prefix covering AT. Custom-slot
  toasts invert too, so the stack has one surface; consumers with bespoke
  content restyle via `::part(root)`.

## Considered options

- **Redefine `inverse-*` to flip per mode:** reuses names, but silently
  breaks the fixed-backdrop contract for existing tenants (inverted button
  variants, hero overlays). Rejected.
- **Stay on `surface-overlay` and adopt only shape/badge/layout:** no token
  work, but rejects the design's core idea — the toast keeps blending with
  cards and popovers. Rejected.
- **Hardcode per-mode values in the component:** violates ADR-0010 and makes
  the look unreachable for consumer theming. Rejected.

## Consequences

- The surface ladder is four rungs; its glossary entry and the toast's place
  on it changed in `CONTEXT.md`.
- Seven new semantic roles are public token API (tokens.css + the Tailwind
  theme export) and must be kept in sync across both semantic maps and the
  export, like every other role.
- Components on the inverted tier use the `*-inverted` roles for *all* their
  colour — mixing ladder inks onto an inverted ground reintroduces the
  mode-flip bug class the semantic layer exists to prevent.
