---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Refactor `c-radio` / `c-radio-group` onto semantic HTML: each `c-radio` now
renders its own native radio input with its default slot as the clickable,
announced label, so radios can be wrapped in arbitrary layout markup at any
depth inside the group — custom option-card layouts are now plain HTML. The
group implements the standard radio-group keyboard pattern (one tab stop on
the checked radio, arrow keys move and select, wrapping and skipping
disabled; Enter no longer selects, leaving it to form submission), gains a
`label` slot for rich label content (the `label` prop stays primary), and
reserves the message row's height so a runtime validation error no longer
shifts the layout. `c-radio` emits a bubbling `change` event carrying its
value. Removed: the group's `items`, `return-object`, and `host-id` props
(author slotted `c-radio` children; values are strings matched against the
group's `value`) and `c-radio`'s `checked` prop (set the group's `value`
instead).
