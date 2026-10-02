# 60. c-number-field values are numbers, grouped by the page language

Date: 2026-09-29

## Status

Accepted. Amended by ADR-0064 (always a numeric keyboard; step buttons
and arrow-key stepping).

## Context

Consumers asked for numeric input with a thousands separator, as an integer
or with decimals. An input mask (ADR-0059) cannot express it: a mask fills
fixed slots left to right, while grouping runs right to left from the
decimal separator, regroups on every keystroke (`1 234` → `12 345`) and comes
with a sign and a fraction. The native `<input type="number">` shows no
separators at all.

## Decision

- A new component, `c-number-field`, on `c-input`. Its value is a JS
  `number`, `null` when the field holds no digit; the display is grouped
  text — the split the date picker makes between its ISO value and its
  `format` (ADR-0057).
- The group and decimal separators come from `Intl.NumberFormat` for the
  page's `lang`, overridable per field or app-wide (`group-separator`,
  `decimal-separator`, ADR-0048). Intl supplies only those two characters:
  there is no `locale` prop. Either `.` or `,` typed reads as the decimal
  separator unless it is the group separator.
- `decimals` caps the fraction digits (`0`, the default, is an integer
  field). Typing never pads; `fixed-decimals` pads the display on blur. The
  integer part is capped at 15 digits so the number stays exact.
- The value follows the text on every keystroke that changes the number
  (`emitModelChange`); a blur tidies the text without emitting.
- `min` / `max` never clamp: an out-of-range number is kept and emitted, and
  reported as `:state(out-of-range)` / `outOfRange`, like **bad input**. At
  `min` ≥ 0 the minus key is ignored and a numeric keyboard is requested.
- The caret machinery is shared with the masks (`applyConform` in
  `src/shared/inputMask.ts`): a Backspace over a group separator deletes the
  digit before it.

## Alternatives considered

- **A number mode on `c-text-field`**: its value would be text in one mode
  and a number in the other, or consumers would parse the grouped text.
- **A spreadsheet-style pattern in `mask`** (`# ##0,00`): one prop with two
  unrelated grammars, and still a text value.
- **A `locale` prop driving `Intl`**: the cross-cutting locale concept
  ADR-0057 rejected; only two characters are needed.
- **Clamping to `min` / `max`**, on blur or per keystroke: silently rewrites
  input, and blocking keystrokes traps typing (with `min="10"`, the first `1`
  is below range).
- **Emitting on commit** (Enter / blur), like the date picker: `v-model`
  would lag behind what is shown; a number has no unparseable middle state
  worth waiting out.

## Consequences

- A field that takes negative numbers leaves `inputmode` unset: numeric
  keyboards on iOS have no minus key.
- A value with more fraction digits than `decimals` is shown rounded but
  kept as set until the user edits.
