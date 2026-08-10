# 25. The sliding indicator is a tab-strip affordance: c-button-group drops it, c-tab-buttons owns it

Date: 2026-08-10

## Status

Accepted

Amends ADR-0023 (reverses its "single-select keeps the signature sliding
indicator" split; the child-driving and adapter architecture it decided is
unchanged).

## Context

ADR-0023 split active-fill rendering by selection mode: single-select
`c-button-group` kept the sliding indicator pill (suppressing the children's
own active fill through inherited `--_c-button-active-*` vars), while
`multiple` dropped the pill and let each active button paint its own look.
That left the form control with two rendering modes, and made the sliding
motion — visually, the signature of a tab strip — part of a form-facing
value control.

The design intent has since sharpened: the sliding indicator belongs to tab
switching only. A `c-button-group` (single or `multiple`) should read as a
value control whose active buttons are simply filled; `c-tab-buttons` should
keep the sliding motion.

The complication is architectural: `c-tab-buttons` wraps `c-button-group` in
its shadow root, and all indicator machinery (geometry measurement,
ResizeObserver, rAF snap choreography, fill suppression) lived in the group.

## Decision

**`c-button-group` renders no indicator in any mode.** Single-select adopts
what ADR-0023 defined for `multiple`: each active button paints its own
`active` fill. The mode split in rendering disappears; the group never
touches the `--_c-button-active-*` vars. `c-button-group::part(indicator)`
is removed from the public part surface.

**`c-tab-buttons` owns the track and the pill.** The indicator machinery
moves into the adapter, which composes it around the wrapped group:

- The adapter's shadow wraps the group in a relative container that draws
  the sunken track background itself, with the pill (`part="indicator"`,
  now a native part) between that track and the group.
- The adapter's shadow stylesheet makes the inner group's box transparent
  via `c-button-group::part(root)`, so the pill shows through and the
  slotted buttons' text paints on top. This is the only way to interleave:
  a sibling element can never paint between another element's opaque
  background and its children.
- The adapter applies the fill suppression (`--_c-button-active-*` →
  transparent + text flip) to the slotted buttons; the group no longer
  knows those vars exist.
- `c-tab-buttons` stops forwarding the group's parts (`exportparts`
  removed); its own wrapper carries `part="root"` so
  `c-tab-buttons::part(root)` keeps addressing the visible track.

## Alternatives considered

- **Keep the pill in the group behind an internal, undocumented flag that
  only the adapter sets**: zero duplication and trivial stacking (the pill
  stays a child of the group's `root`), but the group carries machinery only
  the adapter exercises, and the public no-pill stance would be one
  attribute away from false.
- **Public `indicator` prop on `c-button-group`**: reintroduces the exact
  surface being removed; "the form control has no sliding animation" would
  be a default, not a design statement.
- **Pill kept but with the transition removed** (snap, no motion): keeps two
  rendering modes and the part surface for no visual identity gain.
- **Adapter injects an absolutely-positioned pill into the light DOM** so it
  slots into the group's root and joins its stacking context: works, but
  pollutes the consumer-visible light DOM.

## Consequences

- Public surface: `c-button-group` loses the `indicator` part; its
  single-select visuals change (own-fill instead of pill).
  `c-tab-buttons::part(indicator)` and `::part(root)` keep working, now
  addressing adapter-native elements.
- The group's code loses the indicator geometry, the ResizeObserver, and the
  var retargeting; the adapter gains equivalents, including its own
  child-geometry observation across the slot-forwarding chain.
- A future reader must not "re-unify" the pill into `c-button-group` for
  reuse — the split is the point, not an accident of history.
