Buttons trigger actions — submitting a form, opening a modal, confirming a
choice. Use one filled button (the default `appearance`) per view for its
main action; other actions use `appearance="outlined"`, `"ghost"` or
`"text"`.

## When to use

- Performing an action on the current page (save, send, confirm).
- Navigating with button semantics: set `href` to render a real link styled
  as a button.

## When not to use

- Inline navigation within text — use `c-link`.
- Toggling a persistent on/off state — use `c-switch`.

## Appearances

`appearance` sets how strongly a button reads: `filled` (the default) for the
main action, then `outlined` (an outline, no fill), `ghost` (a light tint)
and `text` (no fill or outline) for lower emphasis. `inverted` is for a fixed
dark or brand-coloured backdrop: it paints the `inverse-*` family, which looks
the same in both theme modes.

The `outlined`, `ghost` and `text` boolean attributes of 3.x still work until
5.0; `appearance` wins when both are set.

## Variants

`variant` sets the button's colour, in every appearance: `primary` (the
default) and `secondary`, the brand colours; `success`, `info` and `warning`;
and `danger` for a destructive action, in the error colour. A colour is not an
emphasis level — make a less important action lighter with `appearance`, not
`secondary`.

```html
<c-button variant="danger">Delete</c-button>
<c-button appearance="outlined" variant="success">Approve</c-button>
```

The filled success, info and warning buttons have a dark label, which stays
readable (WCAG AA) on their lighter fills. Inverted, only the filled look shows
the colour, as its label on the white button; the lighter appearances stay
white.

An app can change the default colour of every `c-button` with
`applyDefaults({ 'c-button': { variant: 'secondary' } })`. The buttons the
library draws inside its own components keep `primary`, and so do the buttons
of `c-tab-buttons`, whose sliding indicator has one colour.

The `danger` attribute of earlier releases still works until 5.0; `variant`
wins when both are set.

## In a form

`type="submit"` submits the `<form>` around the button (validating it first,
as `form.requestSubmit()` does) and `type="reset"` resets it; the default
`button` does nothing to the form. A disabled or loading button, or one with
an `href`, never submits.

```vue
<form @submit.prevent="save">
  <c-button type="submit">Save</c-button>
</form>
```

## Accessibility

The `root` part is a native `<button>` (or `<a>` when `href` is set), so
focus, keyboard activation and screen-reader semantics come from the
platform. When only an icon is slotted, provide an accessible name on the
host, e.g. `aria-label="Close"`.

## Customization

Restyle via CSS parts from your own stylesheet:

```css
c-button::part(root) {
  border-radius: 9999px;
}
```
