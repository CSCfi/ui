Toasts are passive, transient notifications — operation results, background
progress — stacked and managed by a single `c-toasts` container via its
`addToast` / `removeToast` methods.

## When to use

- Confirming a completed action (saved, sent, deleted).
- Non-blocking errors and warnings the user can act on later.

## When not to use

- Anything requiring a decision before continuing — use `c-modal`.
- Persistent page-level status — use `c-alert` or `c-message`.

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
dismiss themselves.
