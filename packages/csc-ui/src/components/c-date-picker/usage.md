A date field that takes a typed date, or opens a calendar panel for picking one, or a start and end date under `range`.

## Value

The value is a calendar date as an ISO `YYYY-MM-DD` string — `'2026-09-28'` —
or `null` when the field is empty. It carries no time and no timezone, so it
round-trips through attributes, JSON and forms unchanged, and whatever the
displayed `format`, the value keeps this one shape. Bind it with `v-model`, or
listen for `change`:

```vue
<c-date-picker v-model="date" label="Start date" />
```

Under `range` the value becomes `{ start, end }`. Picking in the calendar
always yields a complete range; typing can commit one end before the other, so
either end may be `null` — `{ start: '2026-09-01', end: null }` — and a range
with neither end is `null`.

## Typing

The field is typeable first: clicking into it or focusing it never opens the
calendar. Text is read when the user presses Enter or leaves the input, never
per keystroke. The `format` prop sets how dates are shown and read — a pattern
of the tokens `d`, `dd`, `M`, `MM` and `yyyy` with any separators, `dd.MM.yyyy`
by default. Reading is lenient: a day or a month may have one or two digits
whatever the token, and any of `.`, `/`, `-` or a space separates the parts,
so `1.9.2026` and `1/9/2026` both commit as `01.09.2026` under the default. The
year needs all four digits. The format is an app default, so an app can set it
once with `applyDefaults({ 'c-date-picker': { format: 'yyyy-MM-dd' } })`.

Typing follows the format as it goes: the separators appear on their own
(`01012031` shows `01.01.2031`), a day or month closes early when a separator
is typed or when its first digit can start no two-digit value (`4` for a day,
`2` for a month), any of `.`, `/`, `-` or a space typed in place of a
separator shows as the format's own, and other characters are dropped. Pasted
text is kept as it is and read when committed.

Text that names no date that can be picked — `31.02.2026`, a disabled date, a
date outside `min` and `max` — is **bad input**: the text stays as the user
typed it, the value becomes `null`, and the host exposes the `bad-input` custom
state and a read-only `badInput` property. The component never shows an error
of its own; deciding whether bad input is an error, and saying so, is the
consumer's validation:

```vue
<c-date-picker
  v-model="date"
  :error-message="error"
  :valid="!error"
  label="Start date"
  @change:text="
    error = $event.target.badInput ? 'Enter a date as dd.mm.yyyy' : ''
  "
/>
```

Every commit of typed text fires `change:text` with the text as typed
(`{ start, end }` under `range`), whether or not it changed the value — the
moment to read `badInput`, as above.

## The calendar

The calendar button at the field's trailing edge, or Alt+ArrowDown in the
input, opens the calendar panel. It is a dialog: focus moves onto the selected
day, else today, else the nearest day that can be picked, and Tab cycles
through the month and year controls and the grid until the panel closes.
Picking a day commits it and closes the panel; Escape closes it without a
change. Focus returns to the input either way.

| Key                     | In the day grid                       |
| ----------------------- | ------------------------------------- |
| ArrowLeft / ArrowRight  | Previous / next day                   |
| ArrowUp / ArrowDown     | Same day of the previous / next week  |
| Home / End              | First / last day of the week          |
| PageUp / PageDown       | Same day of the previous / next month |
| Shift+PageUp / PageDown | Same day of the previous / next year  |
| Enter / Space           | Pick the day                          |

The month and year buttons in the header swap the grid for a list of months
or years; picking one returns to the grid. The year list reaches a hundred
years either side of today unless `min` and `max` narrow it. The displayed
month is announced to the consumer as `change:month` (`'YYYY-MM'`) whenever it
changes and when the panel opens.

The week starts on Monday; set `first-day-of-week` to another day, numbered
like `Date.getDay()` (`0` for Sunday). `show-week-numbers` adds ISO 8601 week
numbers beside the rows. With a week start other than Monday a row spans two
ISO weeks and shows the one holding most of its days, so a week split across
two months carries the same number in both.

## Ranges

With `range` the field holds two inputs, the start and the end, in one field
box. In the calendar the first day picked is only pending — it is shown and
announced, the band follows the pointer or the focused day, and nothing is
emitted — until the second pick completes the range and closes the panel.
Dismissing the panel in between discards the pending day. Picking the end
before the start swaps them, and so does typing a start later than the end.

## Disabling dates

Three rules decide which dates cannot be picked; a date any of them rules out
is disabled:

- `min` and `max` — ISO dates bounding the calendar itself: the arrows and the
  keyboard stop there.
- `disabled-dates` — a list of ISO dates and inclusive `{ start, end }` spans.
- `is-date-disabled` — a predicate receiving an ISO date, for rules such as
  "no weekends".

The list and the predicate have no attribute form, so bind them as DOM
properties. A disabled day can still be focused in the grid — the arrows keep
their meaning — and is announced as unavailable, but it cannot be picked. A
range may span disabled days: only its start and end must be enabled.

Availability that comes from a server can follow the calendar: load the
disabled dates of the month `change:month` names and assign `disabled-dates`
again.

## Texts

Month and weekday names and each day's accessible name come from `texts` when
given, then from the browser's `Intl` data for the page's `lang`, then from
the English built-ins — so a page with `<html lang="fi">` gets Finnish names
without any configuration. The labels of the buttons and the range inputs are
English unless `texts` replaces them. Weekday arrays are indexed like
`Date.getDay()`, Sunday first. Set them app-wide with
`applyDefaults({ 'c-date-picker': { texts } })`.

## Narrow viewports

On a viewport narrower than 760px the calendar opens as a **fullscreen
panel**: a heading row with the field's `label` and a close button above the
calendar. The field stays typeable at every width.

## Native date input

`c-text-field type="date"` remains the browser's own date input — no custom
calendar, the browser's format, and no ranges or disabled dates. Reach for
`c-date-picker` when the format, the calendar's look or those features matter.

`c-time-picker` is the same typeable field for times of day.
