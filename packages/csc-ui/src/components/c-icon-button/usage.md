An icon-only button: a round native button that shows a single icon and takes
its accessible name from an `aria-label` on the element.

Slot a `c-icon` into it, or pass an icon path in `path` for an icon drawn by
the button itself (the slot wins when both are given). Listen to the native
`click` event; a disabled or loading button does not deliver it.

```vue
<c-icon-button aria-label="Delete" danger @click="remove">
  <c-icon :path="mdiDelete" />
</c-icon-button>
```

## When to use

- A compact action whose icon is widely recognised: close, edit, delete,
  more actions, a toolbar control.
- When there is room for a visible label, prefer `c-button` with the icon in
  its `icon` slot: a label is clearer than an icon alone.
- For navigation, use `c-button` with `href` or `c-link`; an icon button has
  no `href`.

## Appearances

The appearances match `c-button`'s: the default filled primary button for
the main action, then `outlined`, `ghost` (a light primary tint) and `text`
(no fill) for lower emphasis. `danger` turns the filled button into the error
role for a destructive action; it has no effect on the other appearances.
`inverted` is for a fixed dark or brand-coloured backdrop: it paints the
`inverse-*` family, which looks the same in both theme modes.

## Sizes

`size` is `default` (40px), `small` (32px) or `x-small` (28px). A slotted
`<svg>` is sized to match (24, 22 or 18px), but a slotted `c-icon` keeps its
own `size` (24 by default), so set it to fit a smaller button. An icon drawn
from `path` is always 24px.

## Badge

`badge` shows a count in a bubble at the button's top-right corner. It is
hidden while the value is `null` or an empty string, so `badge="0"` still
shows 0. Put the count in the accessible name as well
(`aria-label="3 notifications"`): the label replaces the button's content,
bubble included.

## Disabled and loading

`disabled` disables the native button: it leaves the tab order and ignores
the pointer. `loading` replaces the icon with a spinner and swallows clicks,
but the button stays focusable and the wait is not exposed to assistive
technology; announce it on the region it affects, with `aria-busy` or a
live-region message.

## Accessibility

The `root` part is a native `<button>`, so focus, keyboard activation and the
button role come from the platform. Its name comes from `aria-label` on the
`c-icon-button` element, which is forwarded to the inner button. Without one
the button is named only by the text in its content, which is usually
nothing or the badge count. Prefer `aria-label` to visually hidden slotted
text: while `loading`, the spinner replaces the slotted content, text
included.

To show the name to sighted users too, put the button in a `c-tooltip`'s
`trigger` slot. The tooltip text is announced as a description, so the
`aria-label` is still required.

## Customization

Restyle via CSS parts: `::part(root)` is the button, `::part(content)` the
wrapper around the icon or spinner, and `::part(badge)` the count bubble.

```css
c-icon-button::part(badge) {
  background-color: var(--c-error);
  color: var(--c-on-error);
}
```
