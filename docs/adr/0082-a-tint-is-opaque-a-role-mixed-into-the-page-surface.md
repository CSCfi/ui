# 82. A tint is opaque: a role mixed into the page surface

Date: 2026-11-04

## Status

Accepted. Lands before `4.0.0`, with ADR-0079, ADR-0080 and ADR-0081
(`_plan/dark-overlay-contrast.md`).

## Context

The lighter button appearances, c-alert's box and a few hover states drew a
role at a low alpha, `bg-primary/15` or `bg-(--_c-button-fill)/20`, under text
inked with `on-<role>-subtle`. A see-through background lets the surface
behind it set the label's contrast, and every figure the specs and the audit
checked was measured on the page surface. Elsewhere it fell short:

- **Dark popovers and menus** (`surface-overlay`, slate-700, lighter than the
  page so elevation reads without shadows, ADR-0010): primary's ghost read
  4.29:1 at rest and 3.95:1 hovered. Every secondary state failed, including a
  text button with no wash (4.35:1).
- **The light page canvas** (`surface-sunken`, primary-100, which c-main
  paints): success's ghost read 4.13:1 and c-alert's success heading 4.25:1.
- **The inverted filled hover** was see-through too. Hover replaces the white
  rather than tinting it, so on the dark backdrop the dark label nearly
  vanished.

ADR-0079 had recorded the dark-popover shortfall as a known case.

## Decision

- **A tint is opaque.** Besides the `*-subtle` tokens, a tint can be the role
  mixed a set share into the page surface:
  `color-mix(in srgb, <role> N%, var(--c-surface))`, the internal utility
  `bg-tint-<role>/<n>` (also `bg-tint-(--var)/<n>`).
  - It is the same colour on a card, a popover or the page canvas, so the
    page-surface figures hold everywhere.
  - It mixes in sRGB, the space alpha compositing uses, so on the page
    surface it paints exactly what the see-through wash did. A first build
    mixed in oklab, which came out visibly lighter than the approved look.
  - Converted: the buttons' ghost (14%) and their shared hover (20%); c-alert's
    box (10%) and close hover (20%, which had stacked 10% on 10%); the
    accordion header and expanded item; the breadcrumb bar's crumbs and fold
    button; file-upload's choose button; c-table's mobile rows.
  - The inverted filled hover mixes into `--c-inverse-surface` instead.
  - Text on any tint takes `on-<role>-subtle`; the glossary's **Tint** now
    names both forms.
- **On a tinted container, a tint mixes into the container at half its
  share.** Mixed into the page, a ghost or hover patch nearly vanished on a
  tint: on c-data-table's light banner it read 1.04:1 against the banner.
  - The containers (c-alert's message, c-data-table's banner and its selected
    and hovered rows) set `--_c-tint-ground` to their colour and
    `--_c-tint-scale` to 0.5. A ghost is then 7% and a hover 10%; the patch
    stands out (1.08–1.18) and the lowest label is a dark selected row
    hovered, 4.63:1.
  - c-popover's panel resets both, so a popover opened from a container
    tints into the page again.
  - The full share in a container left dark labels at 4.05–4.44:1.
- **Dark `on-secondary-subtle` is secondary-100**, not 200. Text and
  outlined buttons are transparent at rest, so their label sits on the bare
  rung; secondary-100 reads 6.7:1 on the overlay. Only the button tags use the
  token.
- **`lint:tint` fails a see-through role background.** That covers
  `bg-<role>/<n>`, `bg-<role>-subtle…/<n>`, `bg-(--_c-…)/<n>`, and a `<style>`
  or component `.css` background mixing a role with `transparent`. A ripple or
  a selection indicator's hover ring carries no text and is exempt.
- **Rejected:**
  - **A darker popover surface.** It would have to sit within 1.07:1 of the
    page, against ADR-0010's ladder, and secondary still fails.
  - **Lighter dark inks for primary.** Its ink is shared by 18 components, and
    primary-100 sits near the body text.
  - **A thinner wash on popovers**, set by c-popover and c-menu. It can't fix
    secondary, and it misses apps' own overlays.

## Consequences

- The look only changes off the page surface. On a dark popover a ghost or
  hovered button reads as a slightly darker patch, and on the light canvas an
  alert or a ghost reads as a near-white box.
- Nothing fails on any surface rung in either mode; the lowest is light
  success text on the canvas, 4.61:1.
- **New specs:**
  - `roleContrast.node.spec` checks each button colour's tint ink on every
    surface rung.
  - The button-variant spec checks that the tints are opaque mixes, every
    lighter appearance at rest on every rung, and the inverted hover on a dark
    stage.
  - CAlert.spec checks each heading on every rung, and a button in the message
    tinting into the box.
  - CDataTable.spec checks a hovered button on the banner and in a selected
    row.
- The utility and the container properties are internal. An app's own tinted
  panel gets the page tint; exporting the utility in the consumer theme
  (ADR-0018), or the container properties, would be additive.
