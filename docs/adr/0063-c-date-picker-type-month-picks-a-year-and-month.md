# 63. c-date-picker type="month" picks a year and a month

Date: 2026-10-01

## Status

Accepted

Extends ADR-0057 (date values and the format pattern) and ADR-0058 (the date
picker's field and dialog panel).

## Context

Apps need to pick a month, such as a billing or reporting period, without
picking a day. The browser has `<input type="month">`, whose value is
`'YYYY-MM'`. Everything a month field needs already exists in
`c-date-picker`: the typed field and its mask, `range`, `min`/`max`, the
texts, the fullscreen panel, and the **month list** and **year list**.

ADR-0062 rejected `c-date-picker type="time"` as one component with two value
grammars. A month is different: it is a date with the day dropped. It uses
the same calendar, the same bounds and the same tokens, so it is a subset of
the date grammar rather than a second grammar.

## Decision

- **`type`:** a `type` prop with the values `'date'` (the default) and
  `'month'`, mirroring the native input.
- **Value:** under `type="month"` the value is an ISO `'YYYY-MM'` string.
  Under `range` it is `{ start, end }` of those strings, with the same null
  rules as dates.
  - A full ISO date given in month mode is read by its month, and nothing is
    emitted until the user acts. The next commit emits `'YYYY-MM'`.
  - In date mode, a `'YYYY-MM'` value is not a date and shows as empty.
- **Format:** derived from `format` by dropping the day token and the
  separator beside it: `dd.MM.yyyy` → `MM.yyyy`, `yyyy-MM-dd` → `yyyy-MM`,
  `MM/dd/yyyy` → `MM/yyyy`. A `format` with no day token is used as given. One
  app default therefore covers both modes. Typing and lenient reading follow
  the derived pattern, using the same rules as dates.
- **Panel: a month step, then a year step.** The panel has no header. It
  opens on the **month step**, the twelve months under a "Month" label, with
  the value's month marked and focused.
  - Picking a month collapses it to a **step summary** row ("Month March"),
    and the **year step** unrolls beneath it, focused on the value's year,
    else this year, else the nearest enabled year.
  - Picking a year commits `'YYYY-MM'` and closes the panel.
  - Pressing a summary row returns to its step.
  - Both lists keep the list keys: arrows, Home/End, Enter and Space.
- **Ranges:** the same steps twice, labelled "Start month", "Start year",
  "End month" and "End year".
  - The finished start is a **pending start**, shown as a summary row
    ("Start month March 2026") and announced, never emitted.
  - The end year completes the range and closes the panel. A reversed range
    swaps, and dismissing the panel discards the pending start.
  - There is no range band: no single list shows both ends.
  - The range inputs are named "Start month" and "End month".
- **Disabling:**
  - `min` and `max` accept `'YYYY-MM'` or a full date. A full date counts by
    its month, so `min="2026-03-15"` allows March.
  - A month is disabled only when every one of its days is ruled out by
    `disabled-dates` or `is-date-disabled`. This is the rule c-time-picker
    uses for hours. The predicate still receives days.
  - On the month step, a month is disabled when no allowed year takes it. On
    the year step, a year is disabled when the picked month is disabled in
    it. No path ends at an empty step.
- **Events:** `change:month` announces the displayed month of the day grid,
  so it does not fire in month mode. No `change:year` is added.

## Alternatives considered

- **A separate `c-month-picker`**: cleaner value types, but a second
  calendar-shaped component, and the month and year lists would have to be
  extracted first.
- **A full date pinned to the 1st**: keeps one value type, but the `01` is
  fake data, and the bounds and typing would still work in days.
- **A `precision` prop or a boolean `month`**: `precision` is less familiar
  than the native name, and a boolean cannot grow into a week or year mode.
- **A 3×4 month grid**: a third keyboard model, with new parts and accessible
  names, for a list that already exists.
- **A displayed year with arrows, then a month pick** (the first build of
  this ADR): one pick when the year is right, but the year was a setting
  users had to notice and change first, and in use it was confusing.
- **Year list first, then months**: two steps like the chosen flow, but in
  the opposite order to how a month is said.
- **A Start | End switch for ranges**, as in c-time-picker: each end commits
  on its own, unlike the date range's pending start in the same component.
- **A separate `month-format` prop**: two format defaults to keep in step.
- **Ignoring the day rules, or a new `is-month-disabled`**: either leaves no
  way to disable a single month, or makes a migrated field rewrite its rules.
- **Emitting a normalised value for a full date**: an emission without user
  interaction.

## Consequences

- `CDatePickerValue` widens. Consumers narrow it by `type`, which is the
  price of one component.
- Every month pick is two picks, even when only the month changes. The
  labels and the summary rows explain the flow instead.
- Month mode adds two parts (`step-label`, `step-summary`) and six texts
  (`month`, `year`, `startMonth`, `startYear`, `endMonth`, `endYear`). Date
  mode is unchanged.
- The ISO helpers in `dates.ts` learn `'YYYY-MM'`.
