# 64. c-number-field steps within range and always asks for a numeric keyboard

Date: 2026-10-02

## Status

Accepted

Amends ADR-0060 (c-number-field): replaces its keyboard consequence and
lifts its "no spin buttons, no arrow-key stepping" stance.

## Context

ADR-0060 asked for a numeric keyboard only at `min` ≥ 0, because the
numeric and decimal pads of iOS have no minus key. In practice, most fields
set no `min` and so opened the full text keyboard on a phone, which made the
field feel broken for its main job. Users also asked for a way to nudge the
number by a fixed amount without typing.

## Decision

- **Keyboard**: the field always asks for a numeric pad: `inputmode="decimal"`
  when `decimals` > 0, `numeric` otherwise, whether or not negatives are
  allowed. A typed minus is still read where the keyboard has one (Android,
  desktop). On iOS, a negative is reached by stepping below zero, or by
  pasting.
- **Step buttons** are always shown at the end of the field: stacked up over
  down, or side by side at `size="small"`, where stacked halves would fall
  under the 24px target size of WCAG 2.5.8. A new `step` prop (`1` by
  default, app-defaultable) sets the amount.
- **The grid**: a step moves to the next point of `base + k·step`, where
  `base` is `min`, or `0` without one. A typed number off the grid stays as
  typed and is never bad input, as with the time picker's minute step.
- **Range**: stepping never leaves `min`–`max`. A step that would pass a
  bound lands on it, and that button is disabled at the bound. From an
  out-of-range typed number, a step goes to the nearest bound. Typing still
  never clamps (ADR-0060).
- **Empty field**: counts from `0` (up gives `step`, down gives `−step`), then
  clamps into range.
- A stepped number is rounded to `decimals` digits, so `step` and `decimals`
  stay independent props and float noise (`0.1 + 0.2`) never shows.
- **Other inputs**: ArrowUp/ArrowDown step once and PageUp/PageDown ten
  times, and holding a button repeats. The mouse wheel never steps, so
  scrolling the page over a field cannot change a value.
- **Semantics**: the input is an editable `role="spinbutton"` (the ARIA APG
  pattern) with `aria-valuenow`/`min`/`max` and the grouped text as
  `aria-valuetext`. The buttons are not in the tab order, and pressing one
  never moves focus, so a tap on a phone does not open the keyboard. Their
  labels come from a `texts` prop, as in the date picker.

## Alternatives considered

- **Keep the text keyboard where negatives are allowed**: correct on iOS,
  but it is what most fields got, and stepping now covers the missing minus.
- **A ± sign toggle in the field**: negatives fully typeable on iOS, at the
  cost of a third control beside the step buttons.
- **An `inputmode` pass-through prop**: pushes an iOS quirk onto every
  consumer.
- **Step buttons only when `step` is set**: a field without one could not
  take a negative on iOS at all.
- **A − / + pair, or − and + at either end**: larger touch targets, but the
  stacked chevrons match the familiar desktop spinner. The small size takes
  the pair layout for the target size.
- **Steps that never clamp, like typing**: a button that walks the number out
  of range reads as a bug.
- **Plain addition** (`12` + 5 → `17`): keeps whatever offset was typed.
- **A default step of 10^−decimals**: a price field stepping by 0.01 is
  rarely wanted.

## Consequences

- Every existing number field gains the step buttons.
- On iOS, a negative number in a field without a typed minus is reached by
  stepping or pasting.
