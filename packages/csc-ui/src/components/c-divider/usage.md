A separator: a thin line dividing groups of content, horizontal by default or
vertical with `vertical`.

## When to use

- Between groups of items in a `c-menu`, slotted among its `c-menu-item`
  elements. A `c-menu-label` heads a group; the separator is the line between
  groups.
- Between sections of a card or panel, or between items in a row.
- Not for spacing alone: it always draws a line.

## Orientation

A horizontal separator is a block spanning the full width of its container,
with a small margin above and below. A `vertical` one is an inline-block with
a small margin on each side: in a flex row it stretches to the row's height,
and in running text it is at least 1em tall.

## Accessibility

The line is a `role="separator"` element whose `aria-orientation` follows
`vertical`. It is not focusable; screen readers may announce it, which in a
menu marks the boundary between groups.

## Customization

`::part(root)` is the line itself. It paints the `divider` token, a
translucent ink that reads on every surface in both theme modes, as its
background colour, so set `background-color` to recolour it and `margin` to
change its spacing:

```css
c-divider::part(root) {
  margin-block: 16px;
}
```
