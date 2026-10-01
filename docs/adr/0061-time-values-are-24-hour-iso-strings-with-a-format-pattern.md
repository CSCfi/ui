# 61. Time values are 24-hour ISO strings with a format pattern

Date: 2026-09-30

## Status

Accepted

Extends ADR-0057 (the date value grammar) and ADR-0059 (typing masks) to
`c-time-picker`.

## Context

`c-time-picker` is the library's first time component. It must support 12-
and 24-hour display, be typeable, and follow the date picker, whose value is
an ISO string, whose `format` both displays and parses, and whose names come
from `texts` → `Intl` → English. Finnish writes times as `14.05`, English
as `2:05 PM`: the separator varies as well as the hour cycle.

## Decision

- The value is an ISO `HH:mm` string on a 24-hour clock, `null` when
  empty — no seconds, no date, no timezone — whatever the display. Under
  `range` it is `{ start, end }` as in ADR-0057.
- `format` is a pattern of `H HH h hh mm a` plus literal separators, and it
  sets the hour cycle, the separator and zero-padding. It displays, parses
  and masks typing. Built-in default `HH.mm`, and it is an app default.
- Typing is masked from `format` as the date picker's is (ADR-0059): an hour
  closes early on a digit no two-digit hour starts with, and typing `a`/`p`
  fills the **period**. Pastes stay unmasked.
- Parsing on commit is lenient: `9` → `09:00`, `930` → `09:30`, any of
  `. : space` separates, and a 12-hour field accepts a 24-hour time and
  `a`/`p`. A 12-hour hour with no period reads as AM.
- `min` / `max` are the only constraints. `min` > `max` is invalid, not an
  overnight wrap. A typed time outside them is **bad input**.
- `minute-step` thins the minute column only. A typed off-step minute
  commits as typed.
- In `range`, an end before the start is an **overnight range**: valid,
  never reordered, never bad input.
- AM/PM and the column names come from `texts`, then `Intl` (`dayPeriod`),
  then English.

## Alternatives considered

- **Minutes since midnight / `{ hours, minutes }`**: unreadable or absent
  attribute form, and it breaks the date values' string grammar.
- **The value as displayed text** (like a masked `c-text-field`): the value
  would change with the display mode.
- **An `hour-cycle` prop or a boolean**: cannot produce `14.05`.
- **Hour cycle from the page `lang`**: the locale-driven approach ADR-0057
  rejected (output varies by browser/ICU, which breaks parsing and baselines).
- **Seconds**: not needed. They can be added later as a longer grammar.
- **Step as validation or snapping**: a presentational prop would silently
  become a constraint, or would rewrite what the user typed.
- **`isTimeDisabled` / overnight `min`–`max`**: more API for rare cases,
  which consumer validation covers.
- **Auto-swapping or rejecting reversed ranges**: rules out night shifts and
  maintenance windows.

## Consequences

- The value never equals the displayed text under the default `HH.mm`.
  `usage.md` has to say so.
- A consumer who needs an ordered daytime range checks `start <= end`
  (string comparison works).
