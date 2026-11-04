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
  4.4:1 on its ghost tint.
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
