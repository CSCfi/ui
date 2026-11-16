# 87. c-status picks an appearance, a marker and a size

Date: 2026-11-13

## Status

Accepted. Lands in the release candidates, before `4.0.0`
(`_plan/c-status-appearance-marker.md`).

## Context

`c-status` had one look: the status family's `*-subtle` tint, its
`on-*-subtle` ink, a 1px ring in that ink, and centred text in a box at least
88px wide. A design reference asked for a softer pill in two looks, outlined
and filled, each with an icon or a dot before the text. The colours were
chosen on a rendered light and dark comparison of every candidate on four
grounds (the page, the canvas, a selected table row, a popover), with contrast
figures.

## Decision

- **Three independent props beside `type`**, all **app-defaultable**
  (ADR-0048), so an app sets its house style once:
  - `appearance`: `filled` (the built-in) or `outlined`. It reuses the
    glossary's **appearance** axis from c-button.
  - `marker`: `none` (the built-in), `icon` or `dot`. `none` is a value, not
    just the unset state, so one pill can opt out of an app-wide marker. The
    name avoids "indicator" and "mark", which the selection controls use.
  - `size`: `small` (20px), `default` (24px) or `large` (32px, for a state
    beside a heading).
- **The pill fits its text.** The 88px minimum and the centring go; a page
  that wants equal widths in a column sets `min-width` on `::part(root)`.
- **Filled** keeps the opaque `*-subtle` fill and its `on-*-subtle` ink. Its
  edge is the status colour mixed 40% into the fill, c-alert's border share,
  in place of the ink ring. Every label stays at AA on every ground in both
  modes; the lowest is 4.74:1.
- **Outlined** keeps the ground behind it, with `on-surface` text and an
  `on-surface-muted` edge at 40% that stays visible on every surface. The
  `border` token was 1.00:1 on the dark popover and 1.07:1 on the light canvas.
- **The icon marker is c-toast's badge at pill scale:** the status icon in the
  `on-*-subtle` ink on a halo of the status colour at 20%. The halo is an
  opaque tint (ADR-0082); a filled pill makes its fill the halo's ground.
  The icon holds 3:1 against its halo everywhere (lowest 3.12:1).
- **One status, one icon.** c-alert, c-toast and c-status draw their status
  icons from one map in `src/shared/statusIcons.ts`. Error keeps the
  close-circle icon rather than the reference's exclamation circle.
- **The dot takes the status colour itself.** It is decoration: the text names
  the state and the dot is hidden from assistive technology. In light mode the
  yellow warning dot reads 1.13–1.42:1 and success about 2.1–2.4:1, under the
  3:1 ADR-0080 asks of status icons. This is an accepted exception, because
  the ink colours of the four statuses are too alike in light mode to tell
  apart as small dots.
- **A neutral pill's icon marker is a dot in the halo**, so a neutral pill in a
  column of icon pills keeps a leading mark and lines up with them.
- **An icon in the `icon` slot is the marker**, whatever `marker` says,
  including an app-wide dot. It sits in the same halo and takes its ink. A
  slotted icon that `marker` could hide would disappear without warning.
- **The pill sizes a slotted icon** to its status icons (11, 14 or 18px),
  whatever the icon's own `size`. A `c-icon` is 24px by default and sets its
  size inline inside its own shadow tree, so an unsized icon spilled 6–10px
  out of the halo and over the text, and an app-wide `size` would have broken
  every hand-sized one. c-icon now reads a private `--_c-icon-size` before its
  `size`, as it already reads `--_c-icon-color` before its `color`; the halo
  sets it, and `::slotted()` sizes a plain `<svg>` or `<img>`.
- **One `marker` part** carries whichever shape renders, so a `::part(marker)`
  rule survives a switch between icon and dot.

## Considered options

- **Booleans** (`outlined`, `icon`, `dot`): `icon` and `dot` exclude each
  other, and c-button had just replaced its own `outlined` boolean with
  `appearance`.
- **One combined prop** (`look="outlined-icon"`): every new option multiplies
  its values.
- **c-alert's 10% tint as the fill**: lighter and closer to the reference,
  but light-mode success text read 4.43:1 on a selected c-data-table row.
- **The status colour for the icon** (c-toast's look on its dark surface):
  the light-mode warning glyph read 1.09–1.31:1 against its halo.

## Consequences

- Pages that relied on the 88px minimum to line up a column need the
  `min-width` rule from the usage doc.
- The analyzer's defaultable-binding lint matched any `="<prop>"` in the
  template, so the static `part="marker"` read as binding the `marker` prop.
  It now matches bound attributes only (`:x=`, `v-…=`, `@…=`).
