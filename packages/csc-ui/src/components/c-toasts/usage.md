Toasts are passive, transient notifications — operation results, background
progress — stacked and managed by a single `c-toasts` container via its
`addToast` / `removeToast` methods. `addToast` returns the message's `id` (its
own, or a generated one), which `removeToast` takes; `close` fires on the
container with the message once a toast has left.

## When to use

- Confirming a completed action (saved, sent, deleted).
- Non-blocking errors and warnings the user can act on later.

## When not to use

- Anything requiring a decision before continuing — use `c-modal`.
- Persistent page-level status — use `c-alert`. A field's hint or error message belongs to the field (`c-message` under a control of your own).

## Closing

A toast with a close button can also be swiped away: drag it left or right
and let go past a third of its width, or flick it. A shorter drag springs back,
and a vertical drag scrolls the page as usual. Custom and indeterminate toasts
have no close button and can't be swiped.

A timed toast waits while the pointer hovers over it or presses it, and
carries on with the time it had left. When a toast arrives or leaves, the
others glide to their new places.

## Placement and modals

Place the default (fixed-position) `c-toasts` as a direct child of `body` or
`c-main`. So placed, toasts are guaranteed to paint **above any open modal**
and stay fully interactive — close buttons and hover-to-pause keep working
while a modal blocks the rest of the page.

The `absolute` variant positions the stack inside a container for
in-container notifications. It lives inside your page's stacking contexts,
so it does **not** carry the above-modal guarantee.

## Accessibility

Each toast is a `role="alert"` live region announced assertively when it
appears. Keep messages short; use `persistent` for messages the user must
close themselves.

Swiping is a shortcut, never the only way: every swipeable toast has its
close button. On a touch screen, pressing and holding a toast keeps it up
for as long as the user needs to read it.

## Styling

Each toast's parts are forwarded from the container as `toast-*`:
`c-toasts::part(toast-root)` is a toast's box, and `toast-item`,
`toast-badge`, `toast-content`, `toast-close`, `toast-custom` and
`toast-progress` its pieces.
