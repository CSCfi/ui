# 79. Buttons pick a colour with `variant`

Date: 2026-11-03

## Status

Accepted. Lands before `4.0.0`, with the renames of ADR-0074
(`_plan/csc-ui-button-variants.md`).

## Context

`c-button` and `c-icon-button` were hard-wired to `primary`, apart from a
`danger` boolean that turned only the filled look red. Applications needed the
other brand and status colours on buttons, in every **appearance**, and wanted
to set the default colour once per app. The `inverse-*` family behind
`inverted` had only `inverse-primary` and `inverse-error`. In light mode, white
text read 3.0, 4.3 and 3.2:1 on the success, info and warning fills, and under
2.3:1 on their hover fills.

## Decision

- **A `variant` prop** on both tags: `primary` (the built-in default),
  `secondary`, `success`, `info`, `warning`, `danger`. It combines with every
  appearance and with `inverted`. `secondary` is the plum brand family, a
  colour and not an emphasis level; emphasis stays with `appearance`.
- **`danger` names the action** (destructive) and paints with the `error`
  family; c-alert, c-status and c-toast keep `error` for a status. The `danger`
  boolean is deprecated (ADR-0074): it chooses `danger` while `variant` is unset
  on the element and goes in 5.0. It now colours the lighter appearances too.
- **`variant` is defaultable per tag** (ADR-0048):
  `applyDefaults({ 'c-button': { variant } })`. The element's own `variant`,
  then its `danger`, beat the app default; `appDefault()` takes a fourth
  argument that maps a replaced prop of another shape (`dangerAsVariant`).
- **The library's own buttons stay `primary`.** Every c-button and
  c-icon-button the library renders sets `variant="primary"`, so an app default
  reaches only the app's buttons, and a picker's arrows keep matching its
  selected day. c-tab-buttons pins its slotted buttons to `primary` because its
  single sliding pill has one colour; c-button-group leaves its buttons'
  variants alone and each paints its own pressed fill.
- **Dark labels on the light status fills.** `on-success` and `on-warning`
  take the family's 950 step (5.9 and 5.8:1, 9.5:1 on hover) and `on-info`
  takes black (4.9:1; info-950 reads 4.2:1). White fails on the fills and on
  their lighter hover fills alike, so darker fills with white labels would
  have needed new fill and hover tokens.
- **The lighter appearances ink with `on-<role>-subtle`**, primary included,
  as c-alert does. The role itself drops under AA on its own tint: dark
  primary read 4.2:1 on the ghost tint and 3.8:1 on any hover tint, and error
  4.4:1 on its ghost tint. The ink is the label and the focus ring; the
  outlined border takes the variant's fill (amended below).
- **Inverted shows the variant on the filled look only**, as the label on
  white. New invariant tokens: `inverse-secondary` (secondary-600),
  `inverse-success` (success-700; 600 reads 4.4:1), `inverse-info` (info-600)
  and `inverse-warning` (warning-600, 4.6:1). The inverted lighter appearances
  stay white.

## Consequences

- Each SFC sets the variant's colours as private custom properties on `root`
  (`--_c-button-fill`, `-fill-hover`, `-on-fill`, `-ink`, `-inverse`), and one
  set of appearance compounds paints every colour.
- Primary's outlined, ghost and text labels changed: a darker teal in light
  mode, a lighter one in dark mode. Filled primary is unchanged.
- The warning badge count (c-badge, c-icon-button `badge`) is dark on its
  orange fill, now at AA.
- A spec checks every variant × appearance at AA in both modes, through the
  harness's `contrastRatio()`.
- ADR-0080 made warning yellow and moved `inverse-warning` to warning-800
  (7.2:1): the yellow warning-600 reads 2.5:1 on white. The badge count's fill
  is yellow now, under the same dark label.
- ADR-0081 darkened the light-mode hover of the white-label fills (primary,
  secondary, danger), which read 2.5–3.8:1 hovered, and the spec now checks
  every filled variant hovered.
- Amended 2026-11-04 (`_plan/button-outline-ghost.md`):
  - **The outlined border is the variant's fill**, the filled button's edge;
    in light mode the ink had drawn a near-black teal (primary-700). A border
    is not text, so it takes the role, as ADR-0080's borders do. Light
    warning's border reads 1.6:1 and success 3.0:1, the same edges their
    filled buttons have; the label identifies the button.
  - **The ghost wash is 14% of the fill**, up from 8%, and the three lighter
    appearances share one 20% hover, up from 15%. The ghost has no pressed
    step any more: at 22% dark secondary's label read 4.48:1, and the ripple
    marks the press. On the page surface the lowest label is dark secondary
    hovered, 4.62:1.
  - **Known case: dark popovers and menus** (`surface-overlay`, slate-700).
    The wash is translucent, so it reads against what is behind it. There
    primary's ghost reads 4.29:1 at rest and 3.95:1 hovered (4.66 and 4.23
    before), and secondary falls short in every state, already 4.35:1 as a
    text button with no wash. Only a lighter dark ink can fix that, so it is
    parked in `_plan/dark-overlay-contrast.md`. The library's own lighter
    buttons on overlays are icons, held to 3:1.
  - The spec checks the ring's colour, both washes and every lighter
    appearance hovered at AA, on the page surface.
