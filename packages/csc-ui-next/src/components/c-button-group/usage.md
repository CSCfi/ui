A button group is a segmented control: a compact group of choices rendered
as plain `c-button` children, where activating a button takes effect
immediately (switching a view, picking a billing period). Selection is
exclusive by default; set `multiple` to let several buttons be active at
once. Give the group a `label` when it acts as a form field so the choice
it represents is named for every user.

## When to use

- A small set (2–5) of short options selected in place.
- The selection applies immediately — no separate submit step is implied.

## When not to use

- Long or dynamic option lists — use `c-select`.
- Options that need explanation per choice — use `c-radio-group`
  (or `c-checkbox`es instead of `multiple`).
- Switching between content panels — use `c-tabs` with `c-tab-buttons`,
  which drives this component internally.

## Single vs multiple

Without `multiple` the group holds one value — the active button's `value`
(or its index when no button declares one) — and shows the sliding
indicator. Clicking the active button toggles it off (value `null`) unless
`mandatory` is set.

With `multiple` the value is an array of the active buttons' values in DOM
order, and each active button paints its own fill instead of the sliding
indicator. Arrays have no attribute form — bind `value` as a DOM property
(`:value.prop` in Vue; the React wrapper and property assignment do this
naturally).

## Required vs mandatory

The two props answer different questions and vary independently:

- `required` is a **form-level demand**: this field must be answered before
  the form is submitted. It renders the required marker on the label; your
  form logic enforces it.
- `mandatory` is a **selection-behavior rule**: the selection can never
  become empty. The active button — or, with `multiple`, the last active
  button — cannot be toggled off. It says nothing about whether the form
  demands an answer.

A group can be `mandatory` without being `required` (a view switcher that
always has a selection) or `required` without being `mandatory` (the user
must answer, but may retract while deciding).

## Accessibility

Setting `label` names the group for assistive technology (`role="group"` +
`aria-labelledby`) as well as visually. Each button carries `aria-pressed`
for its active state. Buttons are reachable with the arrow keys once the
group has focus.
