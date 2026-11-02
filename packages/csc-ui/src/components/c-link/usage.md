A text link to another page or resource: a native `<a>` in the link colour,
with an optional underline.

Put the link text in the default slot and set `href`. `target` says where the
link opens, as on a native `<a>`: the same tab unless set, `_blank` for a new
one.

```html
<c-link href="/docs/billing">Read the billing guide</c-link>
```

## When to use

- Navigation in running text, or a list of links.
- For an action, use `c-button` (its `text` appearance looks the lightest);
  for a link that looks like a button, use `c-button` with `href`.

## Underline

`underline` underlines the text. Underline links inside running text, so
they are not told apart from the text around them by colour alone.

## Accessibility

The link is a native `<a>`: focus, Enter, middle-click and open-in-new-tab
come from the platform. Its accessible name is its text, so make the text
say where it leads ("Read the billing guide", not "click here"). Without
`href` the `<a>` has no destination: it is neither focusable nor announced
as a link, so do not use `c-link` for actions.

ARIA attributes (`aria-label`, `aria-current`, …) and the link attributes
`rel`, `download`, `hreflang`, `ping`, `referrerpolicy` and `type` set on the
`c-link` element are forwarded to the inner `<a>`.

## Customization

`::part(root)` is the `<a>`. It paints the `link` role, with the
`link-subtle` fill on hover and a focus ring in the link colour; override the
tokens to re-theme.

```css
c-link::part(root) {
  font-weight: 400;
}
```
