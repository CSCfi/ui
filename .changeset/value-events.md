---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Every value control reports through one set of events with native `<input>`
timing (ADR-0075). `changeValue` and its `change-value` twin are gone from
`c-accordion`, `c-autocomplete`, `c-checkbox`, `c-modal`, `c-otp-input`,
`c-pagination`, `c-radio-group`, `c-select`, `c-slider`, `c-switch`, `c-tabs`
and `c-text-field`, and with them the React wrapper's `onChangeValue`.

- `input` (no detail) and `update:value` (the value) fire on every value
  change, `change` (the value) on every commit: Enter or leaving the field for
  typed text, each pick or toggle, each arrow-key step, the release that ends a
  drag. A commit with nothing changed since the last one fires nothing.
- `change` now carries the value on `c-text-field`, `c-checkbox`, `c-switch`
  and `c-autocomplete`, and no longer bubbles out of the component.
- `c-number-field`'s `change` fires on commit instead of on every keystroke,
  and `c-slider`'s once on release instead of on every move. Listen for
  `update:value` (or `onUpdateValue` in React) to follow every change.
- `c-otp-input`'s value is the digits entered so far everywhere — the `value`
  property, `update:value` and `change` — and `''` when empty; the `value`
  property used to read `null` until the code was complete. A set `value` of
  `''` now clears the digits, and `completion` is typed `string`.

Vue templates bind `v-model`, `@input` reading the element's `value`, or
`@change`; they cannot hear `update:value`.

Fixed: `c-modal` sent its value events twice for every dismissal, and also for
a `value` set to `false` by the page. `c-tabs` sent them twice for Enter on a
tab, and now sends nothing when the current tab is activated again.
