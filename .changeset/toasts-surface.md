---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-toast` is internal: `c-toasts` renders one for each `addToast()` message,
so it has no docs page, element type or React component of its own any more
(ADR-0075). What it offered moves to `c-toasts`:

- A toast's parts are forwarded as `toast-root`, `toast-item`, `toast-badge`,
  `toast-content`, `toast-close`, `toast-custom` and `toast-progress`, so
  `c-toasts::part(toast-root)` styles every toast. The close button's part is
  `close` (it was `dismiss`).
- `c-toasts` fires `close` once a toast has left, carrying its message.
- `addToast()` returns the message's `id`, the one `removeToast()` takes,
  and generates one when the message has none.

A message's `title` is renamed `heading` (`CToastMessage.heading`). A plain
JavaScript message that still sets `title` shows no heading.
