Buttons trigger actions — submitting a form, opening a modal, confirming a
choice. Use one primary (default appearance) button per view; secondary
actions use the `outlined`, `ghost` or `text` appearances.

## When to use

- Performing an action on the current page (save, send, confirm).
- Navigating with button semantics: set `href` to render a real link styled
  as a button.

## When not to use

- Inline navigation within text — use `c-link`.
- Toggling a persistent on/off state — use `c-switch`.

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
