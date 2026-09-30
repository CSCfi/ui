# 62. c-time-picker is the date picker's field with live-commit time columns

Date: 2026-09-30

## Status

Accepted

Extends ADR-0058 (field and dialog panel model), ADR-0043 (peek) and
ADR-0050 (fullscreen panel).

## Context

A time takes two or three picks (hour, minute, **period**), so the date
picker's rule that one pick commits and closes does not carry over. The todo
asks for scrollable side-by-side lists and full keyboard operation.
`CDatePicker.vue` is about 2000 lines, and roughly its field half (range
inputs in one box, commit on Enter/blur, bad input, `change:text`, masked
typing, clear) is what a time picker needs as well.

## Decision

- The field and panel follow ADR-0058: an editable input that never opens
  the panel on click or focus; a clock button or Alt+↓ opens a
  `role="dialog"` panel that takes real DOM focus and cycles Tab inside it;
  Escape returns focus to the input; a **narrow viewport** opens the
  **fullscreen panel**.
- The panel holds **time columns**, each a `role="listbox"` and one tab
  stop, named by `aria-label` with no visible heading. Real focus is on the
  option. Up/Down, Home/End and PageUp/Down move and commit (selection
  follows focus), Enter closes.
- **Live commit**: every pick commits at once and the panel stays open. A
  missing part fills in (minute `00`, the current period). The panel closes
  on Escape, Enter, light dismiss or its close button. There is no OK/Cancel
  row.
- Opening with an empty value focuses the hour column at the current hour,
  with the minute column scrolled to the current minute (rounded to the
  step). Landing commits nothing.
- A pick never produces an out-of-range time: picking an hour that would
  fall outside `min`/`max` with the current minute clamps the minute to the
  bound. Rows outside the bounds are disabled.
- The columns are finite (no looping). On open the selected row scrolls to
  the top, and the column ends on a **peek** row with its scrollbar hidden
  (ADR-0043, via the shared peek helper). The fullscreen layout has no peek.
- Under `range`, an **end switch** above the one column set picks the end
  being edited. It opens on the end whose input was focused last, and each
  end commits live, so there is no pending state.
- The typed-field shell is extracted from `c-date-picker` into `src/shared`
  and both pickers are built on it, in the same piece of work, behind the
  date picker's existing specs and baselines.

## Alternatives considered

- **Commit and close on the minute pick**: fixing the hour means reopening,
  and the order of the 12-hour period is ambiguous.
- **An OK/Cancel footer**: an extra step and row, and it contradicts
  ADR-0058.
- **Space/Enter to select**: more keystrokes, and Enter could no longer
  close.
- **Left/Right between columns as one widget**: not the listbox pattern, so
  screen readers announce it poorly.
- **A centred or looping wheel**: scrolling alone would commit, and a
  looping list never ends for a screen reader.
- **Two column groups side by side for a range**: six columns in 12-hour
  mode, cramped in the fullscreen panel.
- **One clock button per range end**: two trailing buttons in one field box.
- **Copy the field now, extract later**: duplicated fixes from day one.
- **`c-date-picker type="time"`**: one component with two value grammars.

## Consequences

- A panel session can emit several `change`s, one per pick or keystroke,
  like native time spinbuttons.
- `c-date-picker` is refactored onto the shared shell. Its behaviour specs
  and visual baselines must pass unchanged.
- Focus-on-open depends on the clock, so specs pin `Date.now()` for
  empty-open cases.
