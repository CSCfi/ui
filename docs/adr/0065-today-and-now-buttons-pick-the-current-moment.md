# 65. The Today and Now buttons pick the current moment

Date: 2026-10-02

## Status

Accepted

Extends ADR-0058 (the date picker's pick rule and panel), ADR-0062 (the time
picker's live commit) and ADR-0063 (month mode).

## Context

Apps want a one-press way to set a date picker to today and a time picker to
the current time, typically to put a field back to the current moment after
a value far from it was set. The date panel already opens on today when
empty and rings it in the **day grid**; the time panel lands on the current
hour. Neither has a way back once a value is set. ADR-0058 and ADR-0062 both
rejected an OK/Cancel row, so neither panel has a row below its body.

## Decision

- **Opt-in:** `show-today` on `c-date-picker` and `show-now` on
  `c-time-picker`, booleans off by default and `@defaultable`, so an app can
  turn them on everywhere. Today is not a sensible answer for every field (a
  birthdate, a deadline whose `min` excludes it).
- **Placement:** a text button, end-aligned in a row under the panel body.
  It is a native button with the text-button look, like every other control
  in the card, because the panel's focus trap only reaches native buttons.
  The row sits under the day grid, the **month list** / **year list** and the
  **month step** / **year step**, and under the **time columns**. It stays
  through every view swap, sits at the bottom edge of the **fullscreen
  panel**, and is the last Tab stop, so real focus still lands on the grid or
  a column first. It is a single action, not the OK/Cancel row ADR-0058
  rejected: nothing in the panel waits for it.
- **Today = pressing today's cell.** It commits today and closes. Under
  `range` it follows the **pending start** rule: the first press makes today
  the pending start, returns the body to the day grid on today's month and
  focuses today's cell; with a pending start it completes the range, in
  order, and closes. _Amended 2026-10-02 by ADR-0066_: in the fullscreen
  panel a cell press only selects, so Today does too, and Done commits.
- **Month mode:** the button reads "This month" and picks the current month
  as both steps at once: it commits `'YYYY-MM'` and closes, or under `range`
  becomes the pending start and opens the end's month step.
- **Now commits the current time and closes.** It is the time panel's one
  commit that closes; every other pick stays live (ADR-0062). Under `range`
  it sets the end the **end switch** selects, and focus returns to the input
  used last, as on Escape. _Amended 2026-10-02 by ADR-0066_: in the
  fullscreen panel Now only moves the columns, and Done commits.
- **Now is the exact minute**, whatever `minute-step`; seconds are dropped.
  The step stays presentational (ADR-0061), as for a typed off-step minute.
- **Disabled, never hidden:** the button is disabled when today (or this
  month, by ADR-0063's month rule) cannot be picked, or when now is outside
  `min`/`max`. It judges by the rules assigned at the moment, the same rules
  typed text is judged by.
- **Labels:** `texts.today`, `texts.thisMonth` and `texts.now`, English
  built-ins ("Today", "This month", "Now") like every UI label; no `Intl`
  fallback.
- Both read the browser's local clock at the moment of the press.

## Alternatives considered

- **Always on, or on with an opt-out:** puts a control on birthdate-style
  fields where it is never right, and changes every open-panel baseline.
- **Navigate to today without committing:** it does not change the value,
  which is what the button is for.
- **Commit today and keep the date panel open:** a second commit rule in the
  date picker.
- **A one-day range (today–today) on one press:** an odd shape that skips
  the pending start.
- **Now commits and stays open, like every time pick:** consistent with live
  commit, but "now" is a whole value and users press it to be done.
- **Close unless `range`:** two behaviours behind one button by mode.
- **Round or floor Now to `minute-step`:** rounding can commit a future time,
  and either makes the step a rule for one button only.
- **Hide the button when today cannot be picked:** the row comes and goes as
  `disabled-dates` reload per month, and the panel height jumps.
- **In the header, or as a trailing button in the field:** the 320px header
  is full and month mode has none; ADR-0062 rejected two trailing buttons in
  one field box.
- **`Intl.RelativeTimeFormat` labels:** lowercase sentence fragments, and the
  Finnish "this month" (`tässä kuussa`) means "in this month".
- **`today-button` / `now-button`, or one shared `show-current`:** no
  precedent for naming a prop after a control, or vague out of context;
  `show-today` follows `show-week-numbers`.

## Consequences

- Under `type="month"`, `show-today` shows "This month".
- A consumer loading `disabled-dates` per displayed month may not have
  today's month loaded while another month is shown; the button then goes by
  what is loaded, like typed text. `usage.md` says to keep today's dates in
  the list, or to use `is-date-disabled`.
- Under a time `range`, setting both ends with Now takes two openings.
- Each panel gains a row and two parts (the row and the button) only while
  the prop is on; existing baselines are unchanged.
