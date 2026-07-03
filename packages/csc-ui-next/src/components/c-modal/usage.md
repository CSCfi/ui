Modals interrupt the page for a task that must be completed (or explicitly
cancelled) before continuing — confirmations, short forms, destructive-action
warnings. The slotted content is typically a `c-card`.

Open state is controlled: bind `value` (v-model) and react to `changeValue`.
Modals may be stacked — opening a second modal makes it the active one; the
one beneath is dimmed and inert until it becomes topmost again.

## When to use

- Confirming a destructive or irreversible action.
- A short, focused task that must not be left half-done.

## When not to use

- Passive notifications — use `c-toasts`, which stays visible and clickable
  *above* any open modal.
- Large multi-step flows — prefer a dedicated page.

## Dismissal

`dismissable` governs both light-dismiss gestures: clicking the backdrop and
pressing Escape. A non-dismissable modal (the default) responds to either
with a nudge animation instead of closing — it can only be closed by an
explicit action inside it. Escape peels overlays innermost-first: with a
menu or select open inside the modal, the first press closes that overlay,
the next one reaches the modal.

## Accessibility

- **Always set `aria-label` on the `c-modal` element** — the dialog's title
  lives in your slotted content, across a shadow boundary the platform's
  `aria-labelledby` cannot reach, so the label is mirrored from the host.
  Opening an unlabeled modal logs a console warning.
- Focus moves to the first `[autofocus]` element in your content if present,
  else the first focusable element, else the dialog itself. Put `autofocus`
  on the least destructive action of a confirmation dialog.
- On close, focus returns to the element that was focused when the modal
  opened.
- Everything outside the active modal is made `inert` — except toast
  notifications, which stay interactive.

## Scrolling

Page scroll is locked while any modal is open. If your page has a visible
document scrollbar, add `scrollbar-gutter: stable` to the page root to avoid
a layout shift when the scrollbar disappears.

## Layering

Modals do **not** use the browser top layer: fixed-position
`c-toasts` placed at or near body level always paint above every modal and
remain fully interactive. Transient popovers (menus, selects, autocomplete
panels) use the top layer and paint above everything, including modals they
are opened from. There is no z-index knob — paint order is managed by the
library.

## Customization

Restyle via CSS parts from your own stylesheet:

```css
c-modal::part(root) {
  padding: 0;
}

c-modal::part(backdrop) {
  background: rgb(0 0 0 / 0.7);
}
```
