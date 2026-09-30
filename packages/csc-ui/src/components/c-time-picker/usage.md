A time field that takes a typed time, or opens hour and minute columns for picking one, or a start and end time under `range`.

## Value

The value is a time of day as an ISO `HH:mm` string on a 24-hour clock —
`'14:05'` — or `null` when the field is empty. It carries no seconds, no date
and no timezone, and whatever the displayed `format` it keeps this one shape:
a field showing `14.05` or `2:05 PM` holds `'14:05'`. Bind it with `v-model`,
or listen for `change`:

```vue
<c-time-picker v-model="time" label="Start time" />
```

Under `range` the value becomes `{ start, end }`. Either end may be `null`
while only one is set — `{ start: '09:00', end: null }` — and a range with
neither end is `null`.

## Typing

The field is typeable first: clicking into it or focusing it never opens the
columns. Text is read when the user presses Enter or leaves the input, never
per keystroke. The `format` prop sets how times are shown and read — a pattern
of the tokens `H` or `HH` (a 24-hour hour), `h` or `hh` (a 12-hour hour, which
needs the period `a`) and `mm`, with any separators. The default is `HH.mm`;
`HH:mm` and `h:mm a` are common alternatives. The format is an app default, so
an app can set it once with `applyDefaults({ 'c-time-picker': { format: 'HH:mm' } })`.

Typing follows the format as it goes: the separator appears on its own (`930`
shows `9.30`), an hour closes early when its first digit can start no
two-digit hour, any of `.`, `:` or a space typed in place of the separator
shows as the format's own, and in a 12-hour format a typed `a` or `p` fills in
the whole AM or PM text. Reading is lenient:

| Typed   | Reads as                                     |
| ------- | -------------------------------------------- |
| `9`     | `09:00` — a bare hour is on the hour         |
| `930`   | `09:30` — three or four digits split         |
| `9.3`   | `09:03` — one minute digit is that minute    |
| `2 pm`  | `14:00` — a period makes the hour 12-hour    |
| `14.00` | `14:00`, also in a 12-hour field (`2:00 PM`) |

In a 12-hour field an hour typed without a period reads as AM.

Text that names no time that can be picked — `25.00`, a time outside `min`
and `max` — is **bad input**: the text stays as the user typed it, the value
becomes `null`, and the host exposes the `bad-input` custom state and a
read-only `badInput` property. The component never shows an error of its own;
deciding whether bad input is an error, and saying so, is the consumer's
validation:

```vue
<c-time-picker
  v-model="time"
  :error-message="error"
  :valid="!error"
  label="Start time"
  @change:text="error = $event.target.badInput ? 'Enter a time as hh.mm' : ''"
/>
```

Every commit of typed text fires `change:text` with the text as typed
(`{ start, end }` under `range`), whether or not it changed the value.

## The columns

The clock button at the field's trailing edge, or Alt+ArrowDown in the input,
opens the columns: hours and minutes side by side, and an AM/PM column in a
12-hour format. The panel is a dialog: focus moves onto the hour column —
the value's hour, or the current hour when the field is empty — and Tab
cycles through the columns until the panel closes.

Every pick commits at once and the panel stays open, so the hour can be fixed
after the minutes are picked. Picking into an empty field fills in the rest:
minute `00`, and the hour the hour column rests on. Moving in a column is
picking — each arrow key press commits, so a `change` handler doing network
work should debounce.

| Key                 | In a column                                |
| ------------------- | ------------------------------------------ |
| ArrowUp / ArrowDown | Previous / next row                        |
| Home / End          | First / last row                           |
| PageUp / PageDown   | Five rows up / down                        |
| Space               | Pick the focused row                       |
| Enter               | Pick the focused row and close             |
| Escape              | Close; what was picked stays               |
| Tab                 | Next column (the end switch under `range`) |

Focus returns to the input when the panel closes.

## Minute step

`minute-step` spaces the minute column's rows: `15` lists `00`, `15`, `30`
and `45`. It only shapes the column — a typed `14.07` commits as `14:07` and
shows as an extra row between `00` and `15`. Require a step with your own
validation if it matters.

## Min and max

`min` and `max` are ISO `HH:mm` times. Rows outside them are disabled — an
hour only when none of its minutes fit — and a typed time outside them is bad
input. A pick never leaves them: picking hour 9 at `10:15` with `min="09:30"`
commits `09:30`. A `min` later than `max` is not a range across midnight; it
is ignored with a console warning.

## Ranges

With `range` the field holds two inputs, the start and the end, in one field
box, and the panel shows a Start | End switch above the columns. It opens on
the end last typed in; each end commits on its own as it is picked.

An end earlier than the start is an **overnight range** — `22:00` to `06:00`
spans midnight — and is kept as it is, never swapped or flagged. Where a range
must stay within one day, check it in your validation; ISO times compare
correctly as strings:

```ts
const sameDay =
  !value || !value.start || !value.end || value.start <= value.end;
```

## Texts

The AM and PM texts come from `texts` when given, then from the browser's
`Intl` data for the page's `lang`, then from the English built-ins — so a page
with `<html lang="fi">` shows `ap.` and `ip.` without any configuration. The
button, column and range labels are English unless `texts` replaces them. Set
them app-wide with `applyDefaults({ 'c-time-picker': { texts } })`.

## Narrow viewports

On a viewport narrower than 760px the columns open as a **fullscreen panel**:
a heading row with the field's `label` and a close button above the columns.
The field stays typeable at every width.

## Related

`c-date-picker` is the same field for calendar dates. `c-text-field
type="time"` remains the browser's own time input — no columns, the browser's
format, and no ranges.
