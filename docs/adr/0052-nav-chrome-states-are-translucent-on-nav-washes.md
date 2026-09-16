# 52. Nav chrome states paint translucent washes of the nav's own ink

Date: 2026-09-16

## Status

Accepted

Extends ADR-0010 (the semantic layer) and ADR-0036 (the divider is a
translucent ink) to the side navigation; generalises the fix in
`c-side-navigation-title` (commit 7d0675b3).

## Context

The side navigation paints its own **nav family** (`nav-surface`, `nav-active`,
`on-nav`, `on-nav-active`, ADR-0034). The top-level item was moved onto it, but
the sub-item states carried over from the Stencil era still paint **page**
roles — `surface-raised`, `primary-subtle-hover`, `on-primary-subtle`,
`primary` — inside the active parent's `nav-active` pill. Those roles are tuned
for a white or slate page: in dark mode `surface-raised` _is_ the page colour,
so the selected sub-item reads as a grey slab punched into a teal drawer
(2.06:1 against its ground), and every `primary-subtle-hover` state collapses
to about 1.27:1 against the nav. The divider token had the same problem on the
title underline, solved by scoping it to a translucent `on-nav`.

## Decision

Inside the side navigation, hover, indicator and focus states derive from the
ground's own foreground ink — `on-nav` on `nav-surface`, `on-nav-active` on
`nav-active` — as translucent **washes** (`color-mix` of the ink with
transparent at a small alpha), with the same ink as the text. Surface-ladder
roles (`surface-*`) and the primary tint family (`primary-subtle*`,
`on-primary-subtle`) are **not** used for nav chrome.

_Amended 2026-09-16_: the active sub-item's fill is the nav family's own
`nav-sub-active` role rather than a wash in both modes. In light mode the
established look — an opaque white pill on the pale `nav-active` ground — was
right and a dark-teal wash there read as muddy; in dark mode the value is the
18% `on-nav-active` wash, because white would be a slab. One role, two mode
values, is what the semantic layer is for; the wash principle still governs
hover, the indicator bar and the focus ring in both modes.

Considered and rejected: a mode-blind wash for the active fill (muddy in light,
see above); painting the active sub-item as an inverse `nav-surface` chip (high
contrast but a heavier look than the top-level pill); a second ink token
(`on-nav-active` is legible on both values of the fill).

## Consequences

- A wash inherits its legibility from the `on-` pair it is mixed from, so it
  passes in both theme modes without a per-mode value, and a consumer who
  re-seeds the primary family gets consistent nav states for free.
- The sub-item styles lose their page-role classes; the dashboard baselines
  under `c-main` and the new side-navigation baselines are re-authored.
- The same rule applies to any future chrome painted on a nav-family surface;
  a page role appearing there is a bug, not a styling choice.
