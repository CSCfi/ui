# 66. Fullscreen picker panels commit with a Done button

Date: 2026-10-02

## Status

Accepted

Amends ADR-0058 (the date picker's pick rule), ADR-0062 (the time picker's
live commit) and ADR-0065 (Today and Now commit and close), in the
**fullscreen panel** only (ADR-0050).

## Context

On a **narrow viewport** the two pickers commit in two different ways, and
neither lets the user back out:

- The date picker commits and closes on a pick, so a mistaken tap is
  committed before the user has seen it land.
- The time picker commits every pick live and stays open, so the heading
  row's X does nothing but leave, after the value has already changed.

On a phone the X reads as cancel, and native pickers there confirm
explicitly. ADR-0058 and ADR-0062 rejected an OK/Cancel row for an anchored
panel next to a keyboard and pointer, where light dismiss and Escape are the
way out and an extra click costs every pick.

## Decision

- **Fullscreen panel only.** On a narrow viewport the date and time pickers
  collect picks in a **pending value** and commit it with a **Done button**.
  The anchored panel is unchanged: one pick commits and closes the date
  panel, and every pick commits live in the time panel.
- **The pending value** is shown selected in the panel and never emitted. A
  date range's **pending start** is its first half. Under a time `range`,
  both ends wait in it across the **end switch**, and Done commits them in
  one `change`.
- **Every other way out discards it:** the X, Escape, crossing the
  narrow-viewport threshold (which closes the panel, ADR-0050) and the field
  becoming disabled. The X keeps its accessible name, "Close".
- **The Done button** is a filled primary button at the end of a row under
  the panel body, in thumb reach. The Today and Now buttons move to the start
  of the same row. It is a native button for the focus trap, the last Tab
  stop, and reads `texts.done` ("Done").
- **Done's rules:** it is disabled only while a pick is half done (a pending
  start, or under `type="month"` a month picked without its year), so picks
  still never produce a half range. With no pick it commits nothing and just
  closes: no `change`, and bad-input text stays.
- **Today and Now select.** Today is still a press on today's cell, which in
  this layout makes today the pending value (or the pending start) and shows
  today's month. Now moves the edited end's columns to the current minute.
  Done commits either.
- **Keyboard:** Enter on a day cell or a time row selects it and then acts as
  Done; when that leaves a pick half done it only selects. Space selects only,
  and arrow keys in a time column move the pending value.
- **Month mode:** after the year pick the panel stays on the year step, with
  the year checked under the month's summary row, until Done.
- No new announcements: `aria-selected` carries a pick, and the pending
  start keeps its message.
- Only the two pickers change. `c-select`, `c-autocomplete` and
  `c-tree-select` keep their fullscreen behaviour: a single pick commits and
  closes, and multiple selection toggles live, so their X still means
  "close".

## Alternatives considered

- **Done in every layout:** an extra click on every desktop pick, and a row
  on every panel, against ADR-0058's reasons.
- **Every fullscreen panel, multiple selection included:** consistent X
  semantics library-wide, but `c-dropdown`'s separate `<dialog>` mechanism
  doubles the work for a problem reported on the pickers.
- **Done in the heading row** (MD3's full-screen dialog): out of thumb reach
  on a large phone, and the pickers' heading row would differ from
  `c-select`'s.
- **A Cancel and a Done button, keeping the X:** two cancel controls on one
  screen.
- **"OK", "Select" or "Save":** "OK" is terse, "Select" reads oddly for a
  time range, and "Save" suggests the form is being persisted.
- **A text button like Today:** the panel's one primary action would look no
  more important than Today.
- **Today and Now commit and close as a shortcut:** a second commit path,
  and Today would stop meaning "today's cell".
- **Done disabled until a pick changes the value:** a disabled primary
  button with no reason given.
- **Done commits what is shown** (the time panel's resting time on an empty
  field): commits a time the user never picked.
- **Done on a lone pending start commits `{ start, end: null }` or a one-day
  range:** a pick would produce a half range, or a shape the user never
  asked for.
- **Enter only selects:** more keystrokes than the anchored panel for the
  same field.
- **Commit on rotation**, or carrying the pending value into the anchored
  layout: a commit without Done for one exit, or a reversal of ADR-0050's
  "the layouts are not interchangeable mid-open".
- **Naming the X "Cancel":** a new label, and the same X would be announced
  differently from `c-select`'s.
- **Announcing every pick:** noisy where selection follows focus.

## Consequences

- On a narrow viewport the pickers emit `change` only on Done, once per panel
  session. Consumers that saved on every time pick see one event instead.
- The commit model depends on the window's width, so a narrow desktop window
  gets the Done flow too.
- Each picker's fullscreen panel always has the row under its body. Neither
  picker had a fullscreen visual baseline; each gains one.
- The heading row's X means "discard" in the pickers and "close" in the
  multiple-selection fields: a recorded divergence.
