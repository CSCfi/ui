# 75. Events are all-lowercase, and value events follow native timing

Date: 2026-10-23

## Status

Accepted. Supersedes ADR-0021; amends ADR-0017 (its grandfather clause is
gone). Lands before `4.0.0-rc.1`.

## Context

ADR-0017 made every new event name all-lowercase but kept the camelCase
Stencil events (`changeValue`, `itemChange`, `tabChange`, `tabFocus`,
`selectOption`, `dropdownStateChange`, `contentChange`) as the upgrade promise,
and ADR-0021 gave them kebab-case twins so Vue could hear them. By the end of
the alphas the value events had split three ways: seven value controls emitted
only `changeValue`, five emitted `changeValue` and `change`, and the 4.x
pickers emitted only `change`. `change` itself carried no detail on four
components and the value on the rest, fired on commit in `c-text-field` and on
every keystroke in `c-number-field`. A consumer had to know each component's
dialect, and 4.0.0 would have frozen all of it.

## Decision

- **No camelCase event survives 4.0.0**, and with them the twin dispatch goes.
  Every event name is all-lowercase.
- **One vocabulary of value events with native `<input>` timing.** Every value
  control fires `input` (no detail) and `update:value` (the value) on every
  value change, and `change` (the value) on every **commit**: Enter or leaving
  the field for typed text, each pick in a list or panel, the release that ends
  a drag.
- **Vue templates do not use `update:value`**: Vue's runtime skips every
  `onUpdate:` listener on an element (ADR-0017). They bind `v-model`, `@input`
  with the host's `value` (current when `input` fires), or `@change`. A lint
  rule fails `@update:*` on a `c-*` element in a Vue template.
- `c-side-navigation-item` fires `select` when activated, as `c-menu` does.
- **Internal events.** An event a composed child dispatches only to wire its
  parent (`c-tab` → `c-tabs`, `c-dropdown` → `c-select`, `c-tab-item` →
  `c-tab-items`) is marked `@internal` in the event map. The analyzer leaves it
  out of the manifest and the React wrapper, so it sits outside the public API
  (ADR-0074). The same marker hides internal tags, props, slots and methods.

## Considered options

- **Keep the camelCase events, deprecated, until 5.0.** That keeps ADR-0021's
  promise to upgraders, but the inconsistency stays frozen for a whole major
  and every 3.x upgrade still has to learn two vocabularies.
- **`change` fires on every change.** A mechanical rename for upgraders, but a
  text field's `change` would fire per keystroke, unlike a native input, and
  would duplicate `update:value`.
- **Put the value in `input`'s detail, or add `change:value`, for Vue.**
  Rejected: the inner input's native, composed `InputEvent` reaches the host
  with `detail === 0`, and a per-keystroke `change:value` beside a commit
  `change` invites confusion.

## Consequences

- Every 3.x and alpha handler of these events is rewritten; the migration
  guide maps each one, per flavor.
- `c-number-field`'s `change` moves to commit, and `c-slider`'s fires once on
  release. `c-radio`'s composed `change` stops at `c-radio-group`, so the
  group's own `change` does not fire twice.
- The React wrapper loses `onChangeValue` and friends; `onChange` carries the
  value everywhere.
