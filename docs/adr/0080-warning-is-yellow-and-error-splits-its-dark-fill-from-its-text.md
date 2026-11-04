# 80. Warning is yellow; error splits its dark fill from its text

Date: 2026-11-04

## Status

Accepted. Lands before `4.0.0`, with ADR-0079
(`_plan/csc-ui-status-colours.md`).

## Context

The warning and error families read alike. Their seeds, orange `#ff5800` and
red `#dd0c0c`, sat 11° of OKLCH hue apart. In light mode their alert washes and
status chips were both pink; in dark mode both fills were salmon (`#ff8256`
and `#ff7b6b`).

Dark error was salmon for a reason: the `error` token drew both the fills and
the error text, and text needs 4.5:1 on the dark surface. A vivid red cannot
reach that (error-400 read 3.7:1), so f3d9a620 had moved the whole role to the
lighter step 300.

## Decision

- **Warning's seed is `#ffc400`**, a yellow 58° of hue from error. A yellow
  this light cannot ink text or icons at its own steps, so three roles move
  darker:
  - light `on-warning-subtle` goes to warning-800, at 7.2:1 on white and
    6.4:1 on its tint; warning-700 read 3.7:1 on the tint;
  - `inverse-warning` goes to warning-800, at 7.2:1;
  - dark `warning-inverted` goes to warning-700, a toast icon at 4.2:1 on
    white.

  The fills keep their steps, under the dark 950 label (11.4:1). The
  no-results icon in `c-autocomplete` and `c-tree-select` takes
  `on-warning-subtle`, as c-alert's icon does: the yellow `warning` reads
  1.6:1 on the panel.
- **Error's seed is `#dd042a`**: a cooler red at 24° of hue, with the same
  lightness and chroma.
- **Dark error splits its fill from its text.**
  - `error` moves to the vivid error-400 (`#fc3a44`), and `error-hover` to
    error-300. Fills, borders, rings, indicators and icons need 3:1 and get
    3.7:1 on the surface; the filled label (`on-error`, error-950) reads
    5.1:1.
  - Error text takes a new public semantic token, **`on-surface-error`**:
    error-500 in light mode (5.1:1 on white) and error-300 in dark mode
    (5.3:1 on the surface). Every library use of `text-error` that draws text
    moves to it.
- **c-menu-item's danger label inks with `on-error-subtle`**, at rest and
  highlighted: it sits on the menu surface, then on the `error-subtle` tint
  that pairs with that ink. `error` read 4.0:1 on the dark menu and 3.6–3.7:1
  on the tint.
- **Chart slot 3 stays gold** (ADR-0030, amended): it now shares the warning
  hue, but it is darker and duller, so no chart colour moves.

## Consequences

- Error is the only family with a seventh token. The six-token shape of
  ADR-0010 still holds for every family, and `on-surface-error` is a
  foreground of the surface ladder, beside `on-surface-muted`.
- Three cases stay below AA:
  - Error text on the dark overlay surface (menus, popovers) reads 4.0:1, as
    `text-error` did before. Only an app's own content in a c-popover meets
    it.
  - A vivid error outline inside a dark popover reads 2.8:1. The error
    message carries the state there.
  - Light error text on `surface-muted` reads 4.46:1, as before; no error
    text sits on that surface.
- The warning inks are olive-brown rather than orange-brown in light mode:
  that is the dark end of a yellow ramp.
- Lighter hover fills under white labels fail AA in light mode for primary,
  secondary and danger. This predates the decision and is parked in
  `_plan/light-hover-contrast.md`.
- Consumers who re-seed warning or error with `applyTheme` keep these step
  mappings, as with every family (ADR-0011).
