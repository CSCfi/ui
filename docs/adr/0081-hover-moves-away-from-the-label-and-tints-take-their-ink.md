# 81. Hover moves the fill away from its label; text on a tint takes the tint's ink

Date: 2026-11-04

## Status

Accepted. Lands before `4.0.0`, with ADR-0079 and ADR-0080
(`_plan/light-hover-contrast.md`).

## Context

Two contrast failures predated the status-colour retune (ADR-0080), and the
tests had missed both: the button-variant matrix measured buttons only at
rest, and the contrast audit only prints.

- **Light filled hover.** Every filled role lightened on hover (step 300),
  the "lighten on hover" structure ADR-0034 kept from the MyCSC dark spec.
  Dark mode puts dark labels on its fills, so lightening there raises
  contrast. Light mode keeps white labels on primary, secondary and error,
  so lightening lowered it: 2.8, 3.8 and 2.5:1 hovered. The side
  navigation's hover read 4.25:1.
- **A role's colour as text on its own tint.** Highlighted menu items,
  active option rows, the pickers' cells and other hovered controls drew
  `text-primary` on `primary-subtle` or on a wash of primary. In dark mode
  that read 3.72:1, and the same pairing read as low as 1.42:1 in other
  families.

## Decision

- **A hover moves the fill away from its label.** In light mode the
  white-label roles hover on step 600: `primary-hover`, `secondary-hover`
  and `error-hover` read 8.3, 11.7 and 6.9:1, and `nav-surface-hover`
  (primary-600) 8.3:1. Dark-label fills keep lightening on 300, and dark
  mode is unchanged.
  - Rejected: an 8% white state layer (primary 5.5, danger 4.8:1, and not a
    palette step), and step 400 (primary 4.25, danger 3.6:1).
  - The same rule darkens the dark-mode tint hovers whose ink is light:
    info and error `*-subtle-hover` move to 800 (6.6 and 6.7:1), and
    accent, success and warning to 900 (9.2–10.1:1). Primary's already
    darkened.
- **Accent is a light fill with dark labels**, like success, info and
  warning: light `on-accent` is accent-950 (8.4:1; white read 2.14:1) and
  `on-accent-subtle` accent-800 (7.0:1).
- **Link's hovers stay in the family**: light `link-hover` is link-600 and
  `link-subtle-hover` link-50. Both had pointed at accent-100, a pale mint
  that read 1.18:1, the cross-family reference ADR-0034 left open.
- **Text on a role's tint takes the tint's ink**, `on-<role>-subtle`; the
  ring or outline may stay the role. Every place that broke it was fixed,
  only in the tinted state, so text at rest keeps the role colour: dark
  primary text on the tint goes from 3.72 to 5.36:1, and in light mode it
  turns a darker teal (7.45:1).

## Consequences

- In light mode a filled button darkens on hover while a lighter appearance
  or dark-label fill lightens; in dark mode everything lightens. The rule
  behind both is the label's contrast.
- `scripts/check-tint-ink.mjs` (`lint:tint`, part of `lint:guards`) fails a
  class string or `<style>` rule that draws a role's own colour as text on
  that role's tint in the same state. It cannot see colours passed through
  custom properties, such as the buttons' `--_c-button-ink`.
- A node spec, `src/theme/roleContrast.node.spec.ts`, fails the build when
  any role's label misses AA on its fill or hover fill, or its tint ink on
  its tint or hover tint, in either mode. The audit stays the wider report.
- The shared button-variant spec measures every filled variant hovered, in
  both modes, and `src/test/tintInk.spec.ts` reads four tinted states as the
  page paints them.
