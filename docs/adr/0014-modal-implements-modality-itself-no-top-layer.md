---
status: accepted
---

# `c-modal` implements modality itself — no `showModal()`, no top layer

`csc-ui-next`'s `c-modal` opens its native `<dialog>` with **`.show()`**, not
`showModal()`, and implements modality in the library: a shared **modal stack
controller** applies `inert` to everything outside the active modal (exempting
`c-toasts`), manages focus capture/restore, locks page scroll, routes Escape to
the topmost modal, and assigns paint order from fixed internal **stacking
bands** (modal band below the toast band). Each modal renders its own
**backdrop** element; only the active modal's backdrop is visible. This is a
deliberate counterpoint to ADR-0008, where the top layer is called "the primary
win" for the menu family.

## Context

The Stencil-era design placed toasts at `z-index: 10000` and modals in the top
layer via `showModal()`. That combination is broken by construction:

1. **No z-index beats the top layer.** Toasts painted *under* the modal and its
   backdrop, no matter the number.
2. **`showModal()` inerts the whole document** outside the open dialog. Toasts
   were not merely hidden — their close buttons and hover-pause were dead while
   any modal was open.
3. The platform offers **no exemption mechanism**: even re-promoting a toaster
   into the top layer as a `popover="manual"` element would leave it inert
   while a modal dialog is open. The requirements "toasts always on top" and
   "toasts always interactable" are unsatisfiable while any modal uses
   `showModal()`.

Additional pressures: multiple simultaneous modals were coordinated by an
ad-hoc `document.querySelectorAll('c-modal')` sweep; the shared dimmer was a
`c-backdrop` element inside `c-main`'s shadow root that `c-modal` reached into
across two shadow boundaries, with a separate `::backdrop` code path for
standalone (no `c-main`) usage.

## Decisions worth recording

- **The `<dialog>` element stays; only `showModal()` goes.** `.show()` keeps
  the implicit `role="dialog"`, the `open` state and the native `close` event;
  the component adds `aria-modal="true"` itself. The native `close` event is
  the convergence point: a platform-initiated close (e.g. slotted
  `<form method="dialog">`) runs the same teardown as ours, so state never
  desyncs.
- **Modality = `inert`, applied by a stack controller.** The controller walks
  from the active modal's host to `document.body`, inerting siblings along the
  way — page content *and* lower modals. This is real modality (AT + focus)
  with no JS focus trap; Tab exits to browser chrome and re-enters the modal,
  exactly as under `showModal()`.
- **`c-toasts` is exempt, recursively.** A sibling subtree *containing* a
  toaster is never inerted wholesale; the walk descends and inerts around it.
  The exemption is hardcoded (no public opt-out attribute) until a real need
  appears — adding one later is non-breaking.
- **The above-modal/interactive guarantee applies to fixed-position toasters**
  (the default) placed at/near body level. The `absolute` in-container variant
  sits inside author stacking contexts where no assigned z-index can beat the
  modal band — it explicitly forgoes the guarantee.
- **Fixed internal stacking bands, not consumer knobs.** Modal band from 1000
  (controller assigns `base + 2×stackIndex`, backdrop at `dialog − 1`), toast
  band 2000. The `zIndex` prop is **removed** — under a managed stack any
  consumer value either does nothing or breaks the toast/stack invariants.
  Bands are constants, not published tokens, so consumers cannot interleave.
- **Per-modal backdrop, topmost-only visibility.** Each modal owns a
  `part="backdrop"` element beneath its dialog; the controller shows only the
  active modal's. One dim level, one `backdrop-filter`, lower modals read as
  inactive. The shared `c-backdrop` component, the reach into `c-main`'s shadow
  root, and the standalone `::backdrop` path are all deleted — one code path
  with or without `c-main`. Backdrop click also lands on a real element now,
  replacing the rect-math outside-click detection.
- **`dismissable` governs both light-dismiss gestures.** Escape now respects
  it (previously Escape closed even non-dismissable modals); non-dismissable
  modals nudge on both gestures. Escape is a document-level (bubble-phase)
  listener owned by the controller, routed to the active modal only, and
  skipped when an inner overlay (menu, select, autocomplete) consumed the press
  via `preventDefault()` — Escape peels overlays innermost-first.
- **Focus is explicit.** On open: `[autofocus]` in slotted content, else first
  tabbable, else the dialog itself (`tabindex="-1"`) — not the native focusing
  steps, which are unreliable across the slot/shadow boundary. On close: focus
  returns to the element captured at open (capture before `inert` is applied,
  restore after it is lifted). The accessible name is a consumer-set
  `aria-label` mirrored onto the dialog (`aria-labelledby` cannot cross the
  shadow boundary to the slotted title); opening an unlabeled modal warns in
  dev.
- **Scroll lock** = `overflow: hidden` on `document.documentElement` while the
  stack is non-empty (prior inline value restored). Layout-shift mitigation is
  documentation (`scrollbar-gutter: stable`), not injected padding.

## Considered alternatives

- **Keep `showModal()`, make the toaster a top-layer `popover="manual"`.**
  Paint order is fixable (re-promote on show), but the toaster stays inert
  while a modal is open — fails the interactivity requirement outright.
- **Keep `showModal()`, reparent toasts into the active dialog's subtree.**
  Keeps them interactive, but reparenting across shadow roots breaks the live
  region, the stack case, and toast state; rejected as architecturally grim.
- **Plain `<div role="dialog">` instead of `<dialog>`.** Equivalent semantics,
  but re-states everything the element gives for free and loses the native
  `close` convergence. No upside.

## Consequences

- Toasts paint above the modal stack and remain fully interactive (close,
  hover-pause) while modals are open. Menus/autocomplete panels (top layer)
  paint above everything — correct for transient popovers, including ones
  opened from inside a modal.
- Multiple modals stack deterministically; the active modal is the only
  interactive one, with lower modals dimmed by the active backdrop.
- The library owns bookkeeping the browser did before: inert application,
  focus save/restore, scroll lock, Escape routing. The stack controller is the
  single place this lives; `c-modal` itself stays declarative.
- **Breaking (pre-release):** the `zIndex` prop is gone; Escape no longer
  closes non-dismissable modals; `c-backdrop` no longer exists as a component.
- If the platform ever ships a top-layer exemption / "always-on-top" primitive
  for live regions, revisit — the controller isolates everything that would
  need to change.
