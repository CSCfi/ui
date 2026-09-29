# 57. Date values are ISO strings with a numeric format pattern

Date: 2026-09-28

## Status

Accepted

## Context

`c-date-picker` is the library's first date component (3.x had none; the only
native option is `c-text-field type="date"`). It must be typeable, show dates
in a configurable format, support ranges, and name months and weekdays in the
consumer's language. The library had no date, locale or `Intl` code: every
translated string goes through a `texts` property (ADR-0048).

## Decision

- The value is a calendar date as an ISO 8601 `YYYY-MM-DD` string, `null` when
  empty — no time, no timezone. Under the `range` prop it is `{ start, end }`,
  either end may be `null`, and both-null collapses to `null`.
- `format` is a pattern of numeric tokens (`d dd M MM yyyy`) plus literal
  separators, and it both displays and parses. Parsing is lenient: a day or
  month takes one or two digits, any of `. / - space` separates, but the year
  must have four digits. Committed text is reformatted to the pattern.
- Month and weekday names and each day's accessible name come from `texts`.
  A key not supplied falls back to `Intl.DateTimeFormat` for the page's
  `lang`, then to the English built-ins — the library's first use of `Intl`.
- Typed text commits on Enter or blur. Text that does not parse, or names a
  disabled or out-of-range date, is kept as typed and commits `null`, and the
  component flags **bad input** — `:state(bad-input)`, a read-only `badInput`
  property and the raw text on `change:text` — like native
  `<input type=date>` (`value = ''`, `validity.badInput`). It renders no error
  itself: wording is the consumer's validation (see **Error message**).

## Alternatives considered

- **`Date` objects**: no attribute form, mutable, and every value carries a
  time and zone — the classic midnight-UTC off-by-one day.
- **A `locale` prop driving `Intl` for display and parsing**: the parser would
  have to reverse-engineer each locale's numeric order, output varies by
  browser and ICU build (visual baselines), and it adds a cross-cutting
  concept no other component has. `Intl` survives only as the names fallback.
- **Month-name tokens** (`MMM`): hard to parse from typing and to localise.
- **Two-digit years**: century guessing is wrong for birthdates.
- **A built-in "invalid date" message**: would make the component own
  validation wording, contrary to the error-message contract.

## Consequences

- Values round-trip through attributes, JSON and forms unchanged, and compare
  correctly as strings.
- Date arithmetic happens on y/m/d parts built via `Date.UTC`, never on local
  `Date`s.
- A consumer detects bad input from `null` + `badInput`, not from the value.
