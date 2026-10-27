The hamburger menu button that opens and closes the mobile drawer of a `c-side-navigation`.

Place it where the user expects the menu — typically at the end of the `c-toolbar` — and show it only while the navigation is `mobile`. No wiring is needed: each `c-side-navigation` toggles its drawer when any `c-navigation-button` on the page is clicked, and fires `change:open` with the new state.

```vue
<c-toolbar>
  …
  <c-navigation-button v-if="isMobile" />
</c-toolbar>

<c-side-navigation :mobile="isMobile">…</c-side-navigation>
```

## How the navigation hears it

The navigation listens on `document.body` for a click whose target is a `c-navigation-button`. Keep the button in the page's own DOM rather than inside another component's shadow root, and let its click reach the body: a listener that stops the click's propagation keeps the drawer from toggling. Every `c-side-navigation` on the page responds to every navigation button.

The button fires no event of its own. To follow the drawer's state, listen to `change:open` on the navigation, which also covers the drawer's close button, the backdrop and item activation.

## Accessibility

The button is a native `<button>`, reached with Tab and pressed with Enter or Space. Its accessible name is "Menu", from `texts.label`; an `aria-label` on the element does not reach the inner button. Translate it per element:

```vue
<c-navigation-button :texts="{ label: 'Valikko' }" />
```

or for every navigation button at once with `applyDefaults({ 'c-navigation-button': { texts } })` (Customization → App-wide prop defaults).

## Customization

`::part(root)` is the inner icon button's box, for placement such as margins.
