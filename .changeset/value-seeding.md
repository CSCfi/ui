---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Value controls announce only what the user does (ADR-0075):

- `<c-option selected>` sets the initial value of `c-select` and
  `c-autocomplete` once, only while the value is empty, and without a value
  event. `c-select` used to emit on every change to its options and override
  a bound value. With a bound value, initialise the model instead.
- `reset()` is removed from `c-select` and `c-autocomplete`: it announced a
  value set from code. Set `value` to `null` (`[]` with `multiple`).
- `c-checkbox` and `c-switch` hold one state: `value` is it, and `checked` is
  its boolean view. Setting `checked` sets `value` to `true-value` or
  `false-value`, setting `value` updates `checked`, and a bound `value` wins
  over a `checked` attribute. `value` has no built-in default any more.
- The `''` a plain Vue `v-model` writes for an empty model no longer checks a
  `c-checkbox` or `c-switch`.
