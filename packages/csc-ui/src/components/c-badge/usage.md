A small pill that pins a short count or label to the top-right corner of the
element it sits in, such as the number of unread messages on a button.

Put the `c-badge` inside the element it annotates, with the count in the
default slot. The badge is absolutely positioned, so that element must be a
positioning context: inside `c-button` and `c-icon-button` it already is;
anywhere else, give the container `position: relative`.

```html
<c-button>
  Messages
  <c-badge>2</c-badge>
</c-button>
```

## When to use

- A count or short marker on another element: unread messages, pending
  approvals, new items.
- On a `c-icon-button`, set its `badge` prop instead of slotting a badge; a
  `c-tag` likewise takes its count in its own `badge` prop.
- For a word naming the state of a record (Active, Expired), use
  `c-status`.

## Appearance

The badge fills with the warning role and its `on-warning` ink, and a 2px
ring in the `surface` colour sets it off from whatever it overlaps. It is
16px tall and grows with its text, so keep the content to a few characters.
It ignores the pointer: clicks pass through to the element beneath.

## Accessibility

The badge has no role: its text is read as part of whatever contains it.
Inside a button it joins the button's accessible name ("Messages 2"), so
check that the combination makes sense, or set an `aria-label` on the button
that states the count in words ("Messages, 2 unread"). A changed count is
not announced.

## Customization

`::part(root)` is the pill. Recolour it with semantic tokens so it follows
the theme mode:

```css
c-badge.done::part(root) {
  background-color: var(--c-success);
  color: var(--c-on-success);
}
```
