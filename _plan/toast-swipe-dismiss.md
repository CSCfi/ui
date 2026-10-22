# Swipe dismiss for toasts + a gliding toast stack

## Context

Users should be able to dismiss a `c-toast` by dragging it off screen (the swipe-away
gesture from mobile notification UIs), alongside its dismiss button. Today a toast closes
only via its dismiss button, the auto-close timer, or `c-toasts.removeToast(id)`; when one
leaves (or arrives), its neighbours jump into place on the next frame. Touch users also have
no way to pause a toast — only mouse hover pauses it. Neither `c-toast` nor `c-toasts` has a
spec or a visual baseline yet.

Grilled 2026-10-22. The glossary's **Dismissable** is a *modal* property (backdrop + Escape),
so the toast gesture gets its own term: **Swipe dismiss**.

## Decisions

1. **Scope**: only toasts that show a dismiss button — standard (non-`custom`),
   non-`indeterminate`, `persistent` included. The swipe is a second path to the button's
   dismissal; the button is the WCAG 2.5.1 single-pointer alternative. No opt-out (the
   button has none either).
2. **Direction**: horizontal, left or right, every placement. A swipeable toast declares
   `touch-action: pan-y pinch-zoom`: vertical page scrolling and pinch-zoom keep working
   for touches that start on it.
3. **Pointers**: mouse, touch, pen (`isPrimary`, `button === 0`). A press claims the swipe
   after ~10px of horizontal-dominant travel; vertical-dominant travel abandons tracking
   for that press. On claim: pointer capture, clear the selection, `grabbing` cursor (no
   grab cursor at rest). Double/triple-click still select text. A claimed press that ends
   on the dismiss button does not click it.
4. **Release rule**: dismiss when released past ⅓ of the toast's width from rest, or flung
   at ≥ 0.5 px/ms in the direction of travel (velocity over the last ~100ms of moves). A
   flick back toward rest springs back even past ⅓. Otherwise spring back. A
   `pointercancel` (or lost capture) during a live drag springs back.
5. **Motion**: 1:1 tracking; opacity falls linearly to 0.5 at the threshold, floored at
   0.2. Dismiss continues the slide by the toast's own width while fading to 0 (~250ms
   ease-out). Spring-back eases to rest (~250ms).
6. **Reduced motion**: still tracks the pointer. On release, a dismiss is the existing 0.2s
   cross-fade from the release position; a spring-back snaps instantly.
7. **Timer**: a press on *any* timed toast (custom included — the hover-pause set) pauses
   the timer and progress bar from `pointerdown` until release/cancel, wherever the pointer
   is released. It resumes with the remaining time only when the toast is neither pressed
   nor hovered. Touch users gain press-and-hold-to-pause (WCAG 2.2.1). Hover keeps today's
   `mouseenter`/`mouseleave` semantics (a tap on touch still leaves a sticky hover pause,
   as today).
8. **Event**: same `close` event and detail as the button. No new public event, prop,
   part, custom state or export.
9. **Stack glide** (scope expanded): c-toasts glides the toasts that move whenever the
   stack's membership changes — arrivals (`addToast`) and every dismissal path (button,
   timer, swipe, `removeToast`). Instant under reduced motion.
10. **Gap timing**: the glide starts when the exit starts. The leaving toast is pinned out
    of flow at its current spot, paints above its neighbours and stops taking pointer
    events while it fades; the neighbours glide beneath it. `close` still fires at the end
    of the exit.
11. **Docs**: ADR-0073 + glossary entries **Toast** and **Swipe dismiss**.

## Implementation

### `src/components/c-toast/swipe.ts` (new, colocated pure helper — like `c-color-picker/colors.ts`)
Constants (`SWIPE_SLOP_PX = 10`, `SWIPE_DISMISS_FRACTION = 1/3`, `SWIPE_FLICK_PX_PER_MS = 0.5`,
`SWIPE_VELOCITY_WINDOW_MS = 100`, opacity 0.5 at threshold / 0.2 floor) and pure functions:
`claimsSwipe(dx, dy)`, `swipeVelocity(samples, now)` (uses `event.timeStamp`; guards
`dt <= 0` → 0, never NaN/Infinity), `swipeOutcome({ dx, velocity, width })` →
`'dismiss' | 'return'`, `swipeOpacity(dx, width)`. Its types stay here — no new exports
from either SFC's plain `<script>` (the analyzer would demand `index.ts` re-exports).

### Stack ↔ toast channel: `_`-prefixed expose (existing convention)
c-toasts adds `_toastLeaving(toast: HTMLElement)` to its `defineExpose` (the analyzer
drops `_` names from the manifest, cf. `CRadio.vue` `_syncGroupState`). c-toast reaches it
via `(host.getRootNode() as ShadowRoot).host`; a bare c-toast finds no method and simply
doesn't glide. (Rejected: provide/inject — it works on Vue 3.5.39, but it would be the
library's first use and relies on CE context inheritance that changed across 3.5.x.)

### `src/components/c-toast/CToast.vue`
- **Timer on `performance.now()`** (not `Date.now()`).
- **Hold model** replaces the ad-hoc hover handlers: a `holds` set (`'hover' | 'press'`);
  pause only on 0→1, resume only on 1→0; a `mouseleave` without a prior `mouseenter` is
  ignored (today it arms a second timeout, CToast.vue:256-261); `start()` respects holds
  already present. Persistent/indeterminate toasts have no timer and ignore holds. A
  `.held` host class drives the progress bar's play-state (replaces `:host(:hover)`).
- **Press tracking**: host `pointerdown` (`isPrimary && button === 0`) → press hold, plus
  capture-phase `pointerup`/`pointercancel` listeners on `document` for that `pointerId`
  (the `attachPointerPair` pattern, `src/shared/lightDismiss.ts:35-56`), so a release off
  the toast still ends the hold; removed on release and in `onBeforeUnmount`.
- **Swipe** (only while `.swipeable` = `message && !custom && !indeterminate && !closed`):
  host `pointermove` → before claim run `claimsSwipe`; on claim `setPointerCapture` (in
  try/catch, as `CColorPicker.vue:1092-1096`), `document.getSelection()?.removeAllRanges()`,
  add `.swiping`; while claimed `preventDefault()`, clear the selection again, and write
  inline `transform: translateX(dx)` + `opacity` with `transition-property: none`.
  `pointerup` → reset drag state *first*, then `swipeOutcome` → `leave('swipe', dir)` or
  spring back. `pointercancel` / `lostpointercapture` cancel only while a drag is still live
  for that `pointerId` (lost capture always follows `pointerup`). `releasePointerCapture`
  in try/catch. No `selectstart` handler (not composed; fires before the claim).
- **Click swallow**: copy `src/shared/useScrollStrip.ts:143-160` — after a claimed press,
  arm a host capture-phase `click` listener `{ capture: true, once: true }` on `pointerup`
  and disarm it in the next rAF.
- **Exit** — one `leave(kind, dir?)` behind `close()` (kept zero-argument; the template's
  `@click="close"` passes a MouseEvent) and `closeToast`:
  1. abort any live drag (release capture, `removeProperty` the drag styles only — never
     `cssText = ''`, which would drop the stack's pin);
  2. call the stack's `_toastLeaving(host)` *before* changing styles;
  3. add `.leaving`; always remove `.show`; for a swipe under full motion set the inline
     250ms ease-out transition + `translateX(dx ± width)`; under reduced motion keep the
     inline `transform` and just remove the inline `transition-property` + `opacity`, so
     the sheet's 0.2s fade runs from the release position;
  4. `finish()` — idempotent, emits `close` — runs on `transitionend` with
     `propertyName === 'opacity'`, from a fallback `setTimeout` (~600ms) for exits that
     never transition (`display: none` ancestor, `transitioncancel`), and immediately if
     `.show` was never added (a `removeToast` in the first frame).
- **Spring-back** via WAAPI: `host.animate` from the current transform/opacity to rest
  (250ms ease-out; skipped under reduced motion), then `removeProperty` the drag styles in
  `finished`; cancelled by a new press (which starts from the current computed offset) or by
  `leave()`.
- **Escape-hatch sheet**: `:host(.swipeable) { touch-action: pan-y pinch-zoom }`,
  `:host(.swiping) { user-select: none; cursor: grabbing }`,
  `:host(.leaving) { pointer-events: none }`, `:host(.held)` replaces `:host(:hover)`;
  update the sheet's explanatory comment.

### `src/components/c-toasts/CToasts.vue`
- Root `tv` slot gains `relative` (the pinned leaving toast positions against it).
- **FLIP helper** (in the SFC), in this order: `snapshot()` (rects of the non-leaving
  children) → change the layout → cancel every running glide (`getAnimations()` filtered by
  `id: 'c-toasts-glide'`) → measure → for each child with a non-zero Δy,
  `el.animate([{ translate: \`0 ${dy}px\` }, { translate: '0 0' }], { duration: 250, easing: 'ease-out', id: 'c-toasts-glide' })`.
  Vertical only; the independent `translate` property never fights a toast's own
  enter/exit/swipe `transform`. Skipped under `prefersReducedMotion()`
  (`src/shared/reducedMotion.ts`).
- `_toastLeaving(toast)`: measure, then pin — bottom stacks with
  `bottom = root.clientHeight − offsetTop − offsetHeight`, top stacks with `top = offsetTop`
  (a `top` pin in a bottom-anchored stack would drop with the shrinking root);
  `left = offsetLeft`; `width` from `getComputedStyle(toast).width` (fractional — no
  re-wrap); inline `z-index: 1` (paints above neighbours gliding into the gap); then glide.
- **Arrivals**: inside `addToast`'s existing rAF, `snapshot()` → push the message →
  `await nextTick()` (resolves after the whole flush, before paint) → find the new element
  by diffing the children set → glide; if it isn't there, skip the glide (no rAF fallback,
  which would paint the jump).
- `onChildClose`'s DOM removal is unchanged — the element is already out of flow.
- Known, accepted: under `absolute`, a swipe slide-out can briefly overflow the container.

### Docs, glossary, ADR, changeset
- `c-toasts/usage.md`: a **Dismissing** section (button; swipe dismiss left/right past a
  third or with a flick; not on custom or indeterminate toasts; hover or press-and-hold
  pauses the timer) and a sentence in **Accessibility** (swipe is an alternative to the
  button; press-and-hold pause for touch). `c-toast/usage.md`: one line on swipe dismiss.
- `CONTEXT.md` (Overlays, beside **Light dismiss**): **Toast** (`c-toast` in the `c-toasts`
  stack: passive, transient, inverted surface, auto-closes unless persistent) and **Swipe
  dismiss**; add "a toast's swipe dismiss" to **Dismissable**'s boundary.
- `docs/adr/0073-toasts-swipe-dismiss-horizontally-and-the-stack-glides.md`: decisions 1–10
  with the rejected alternatives (edge/vertical swipes, touch-only, `user-select: none`,
  glide after exit, provide/inject). Flag for device check: Chrome Android long-press on
  text sends `pointercancel` (~500ms), ending the press-and-hold pause there.
- `.changeset/*.md`: `minor` for `@cscfi/csc-ui` (fixed group with the React wrapper),
  user-facing wording.
- Copy this plan to `_plan/toast-swipe-dismiss.md`.

## Verification

- `src/components/c-toast/swipe.node.spec.ts`: claim slop and axis dominance; threshold at
  ⅓ width; flick both ways; reversed flick returns; `dt <= 0` → finite velocity; opacity
  curve and floor.
- `src/components/c-toast/CToast.spec.ts` (browser; a pointer helper that sets
  `isPrimary: true`, `pointerType: 'mouse'`, `buttons: 1` on moves; slow drags spaced with
  `settle(120)`+, flicks with `nextFrame()`; `recordEvents(host, ['close'])`;
  `expect.poll` for timing): past-⅓ drag dismisses with exactly one `close` carrying the
  message; short slow drag springs back with no `close` and no leftover inline drag styles;
  short fast flick dismisses; reversed flick returns; vertical-dominant move never moves
  the toast; custom and indeterminate toasts don't move; press pauses the timer
  (`duration` ≥ 1000ms, hold past it, release on `document` → closes after the remainder);
  a release off the toast ends the hold; `closeToast()` mid-drag and in the first frame
  both emit `close`; reduced-motion swipe dismiss emits `close` (the B hazard) with the
  toast fading in place; full-motion swipe exit moves along x inside `withMotion()`.
- `src/components/c-toasts/CToasts.spec.ts`: in **both** placements the leaving toast's
  rect top is unchanged across the pin and across an `addToast` during its exit; under
  `withMotion()`, removing the middle of three starts a `c-toasts-glide` animation only on
  the toasts that move, and an `addToast` glides the existing toasts in a bottom stack; the
  leaving toast is absolute with `pointer-events: none` and `z-index: 1`; no
  `c-toasts-glide` animations under reduce. Resting visual baseline of a two-toast stack of
  `persistent` messages per mode, screenshotting the c-toasts host
  (`matchScreenshotInBothModes`, authored with `vitest run <path> --update`, path first).
- Manual (docs dev server `pnpm dev`, c-toasts page): the dismiss-button click swallow
  after a claimed drag (synthetic events never produce `click`); mouse drag over text, also
  leaving the toast over page text (selection stays cleared); Chromium touch emulation;
  vertical scroll and pinch-zoom over a toast on a narrow viewport; glide in top and bottom
  placements; OS reduced motion.
- `pnpm ui lint`, `pnpm ui build` (manifest/api snapshots: no new events/props/parts), CI
  `type-check` (memory: `pnpm build` skips spec types), `pnpm test`.

## Implementation notes (2026-10-22)

- Real-input check over CDP (mouse and touch emulation): 13 checks pass,
  including the dismiss-button click swallow, drag over text, double-click,
  touch swipe, vertical touch scroll and touch press-and-hold.
- Found by that check: a touch press is implicitly captured by the inner
  element; moving capture to the host fires that element's
  `lostpointercapture`, which bubbled to the host's listener and cancelled
  every touch drag. Fixed by only reacting when `composedPath()[0]` is the host
  (spec: "keeps dragging when a touch hands its implicit capture to the host").
- After a touch press-and-hold, Chromium also fires the tap's compatibility
  `mouseenter`, so the hover hold keeps the toast paused until a tap
  elsewhere — the pre-existing sticky tap pause, kept by decision 7.
