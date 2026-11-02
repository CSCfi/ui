A status pill: a short word naming the state of a record, such as Active,
Pending or Failed, tinted with the colours of its status type.

Put the text in the default slot and pick a `type`. `info`, `success`,
`warning` and `error` paint that status family's subtle tint with its ink,
outlined in the same ink; omitting `type` renders a neutral grey pill.

```html
<c-status type="success">Active</c-status>
```

## When to use

- The state of an item in a table cell, list row or card: a job, an account,
  a booking.
- For a message that explains a situation or asks the user to act, use
  `c-alert`: a persistent box in the page flow with a heading, an icon and a
  live-region role.
- For feedback on an action the user just took, use `c-toasts`.
- For items in a set that the user picks or removes, use `c-tag` elements in
  a `c-tags`; a status pill is not interactive.
- For a count on another element, use `c-badge`.

## Sizing

The pill is at least 88px wide and 24px tall, so short labels in a column
line up; longer text widens it.

## Accessibility

The pill has no role and is not focusable: assistive technology reads its
text inline, and its colour is not conveyed. Make the text name the state on
its own. A changed status is not announced; when the user must hear about the
change, tell them through a live region, such as a `c-alert` or a toast.

## Customization

`::part(root)` is the pill. Its colours come from the status families'
`*-subtle` fill and `on-*-subtle` ink roles, and the outline draws in the ink
colour, so setting `color` on the part recolours text and outline together.

```css
c-status::part(root) {
  min-width: 0;
}
```
