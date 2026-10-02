# 58. c-date-picker is an editable field with a dialog grid

Date: 2026-09-28

## Status

Accepted

Extends ADR-0047 and ADR-0050 (`useAnchoredPanel` and the fullscreen panel
gain their first editable field).

## Context

The other value-selection fields built on `useAnchoredPanel`
(`c-autocomplete`, `c-tree-select`) have a readonly value field, open on a
click in the field, keep DOM focus in a search input and highlight rows
virtually with `aria-activedescendant`. A date picker must be typeable without
the panel ever getting in the way, and its calendar is two-dimensional:
`aria-activedescendant` over a grid is poorly supported by screen readers.

## Decision

- The field is an editable `<input inputmode="numeric">` (two of them, start
  and end, in one field box under `range`). Clicking or focusing the text
  never opens the panel; a trailing calendar button and Alt+ArrowDown do.
  The same model holds on every viewport; a narrow viewport opens the
  fullscreen panel (ADR-0050), which holds no text input. On a touch screen
  the calendar button is the panel's only opener, so in a default field it
  is a 40px button with a 24px icon, bigger than `c-select`'s 28px chevron,
  whose whole field opens the panel; a small field's 36px box keeps 28px with
  a 20px icon, and the clear button stays 28px beside it. The time picker's
  clock button follows (ADR-0062).
- The panel is a `role="dialog"` named by the field label, following the
  WAI-ARIA date-picker-dialog pattern: real DOM focus moves onto the day grid
  (one roving tab stop — the selected day, else today, else the nearest
  enabled day), Tab cycles within the panel, Escape closes and returns focus
  to the input. It stays light-dismissable on a wide viewport.
- The month and year controls swap the panel body for an in-panel listbox
  rather than opening nested popovers, so no popover chain forms.
- A pick commits and closes; there is no Cancel/OK row. In range mode the
  first pick is a pending start, emitted only when the second pick completes
  the range. _Amended 2026-10-02 by ADR-0066_: in the fullscreen panel a pick
  only selects, and a Done button commits.

## Alternatives considered

- **Open on a click in the field** (MD3 docked): covers what the user is
  typing and splits focus between input and grid.
- **Virtual focus over the grid**: consistent with the listbox fields, but
  unreliable for grids in assistive technology.
- **Non-trapping, like `c-popover`**: a keyboard user tabbing past the last
  control would lose a pending range start.
- **Nested month/year menus**: two top-layer popovers inside an anchored or
  fullscreen panel.

## Consequences

- The library's first focus-trapping transient surface; `c-popover` still
  never traps (ADR-0033).
- The day-grid keyboard model is net-new code, not shared with the listboxes.
