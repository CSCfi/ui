A grid of sign-in choices, one `c-login-button` per identity provider, each showing the provider's logo above its name.

Use it where a service lets the user pick how to sign in, such as Haka, Virtu or a CSC account. Each `c-login-button` is that provider's sign-in: set its `href` to make it a link (or handle its `click` without one), the logo in `src` and the provider's name in the default slot. The grid has no props or events of its own.

```html
<c-login-buttons>
  <c-login-button href="/login/haka" src="/img/haka.svg">
    Haka login
  </c-login-button>
  <c-login-button href="/login/virtu" src="/img/virtu.svg">
    Virtu login
  </c-login-button>
  <c-login-button href="/login/csc" src="/img/csc.svg">
    CSC login
  </c-login-button>
</c-login-buttons>
```

## When to use

- On a sign-in page that offers more than one identity provider.
- For a single sign-in action, use a `c-button`.

## Layout

The grid fits as many columns as its width allows, each at least 12rem wide, and shares each row evenly between them; the buttons move onto further rows as the space narrows. Every button in a row takes the height of the tallest.

## Logos

`src` loads the provider's logo into an `<img>`, centred above the name and scaled down to fit the button. For markup an `<img>` cannot carry, such as an inline `<svg>` or a `<picture>`, use the button's `image` slot, which replaces the `<img>`.

## Accessibility

With `href` a button is a real link: focus, Enter, middle-click and open-in-new-tab come from the platform. Without `href` it is a native button that Enter and Space press, firing `click`.

A button's accessible name is the logo's `alt` followed by the name in the default slot. The name already identifies the provider, so leave `alt` empty (the default) unless the logo says something the name does not. Mark an inline `<svg>` in the `image` slot `aria-hidden="true"` for the same reason.

## Customization

`c-login-buttons` is itself the grid container, so set `gap` or `grid-template-columns` on the element to change the columns:

```css
c-login-buttons {
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}
```

Each button's parts are `::part(root)` (the link or button box), `::part(image-wrap)` (the area that centres the logo), `::part(image)` (the default `<img>`) and `::part(label)` (the bar holding the name).
