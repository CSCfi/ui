# 73. Toasts swipe-dismiss horizontally and the stack glides

Date: 2026-10-22

## Status

Accepted

## Context

A toast closed only through its dismiss button, its timer or
`removeToast`. On a phone, people expect to push a notification away, and
the button is a small target at the screen edge. Only mouse hover paused the
timer, so touch users had no way to keep a toast up while reading it. When a
toast arrived or left, its neighbours jumped to their new places in one
frame. A swipe that takes the toast away makes that jump more visible.

## Decision

- **Swipe dismiss is a second path to the dismiss button.** Only a toast
  with a dismiss button takes it: a standard toast that is not
  `indeterminate`, `persistent` included. `custom` and `indeterminate`
  toasts are unchanged. The button is the single-pointer alternative WCAG
  2.5.1 asks of a path gesture. There is no opt-out, as the button has none.
- **Horizontal, either way, in every placement.** A swipeable toast declares
  `touch-action: pan-y pinch-zoom`, so a vertical swipe or a pinch that
  starts on it still scrolls or zooms the page.
- **Every pointer.** A press claims the swipe after about 10px of mostly
  horizontal travel; mostly vertical travel leaves the press alone. Claiming
  clears any text selection the press started, so a mouse drag across the
  message moves the toast instead of selecting. Double- and triple-click
  still select. A claimed press never clicks the dismiss button.
- **Release rule.** Letting go past a third of the toast's width, or with a
  flick of 0.5 px/ms or more in the direction of travel, dismisses. A flick
  back toward rest springs back even past a third. Anything else springs
  back, and so does a cancelled pointer.
- **Motion.** The toast follows the pointer one to one and fades with the
  distance, to half opacity at the threshold. A dismissal carries on by the
  toast's own width while it fades out. Under reduced motion (ADR-0057) the
  toast still follows the pointer, which the user drives; a dismissal is the
  toast's 0.2s cross-fade where it was let go, and a spring-back snaps.
- **A press pauses the timer.** From `pointerdown` until the release,
  wherever the release lands, the timer and the progress bar wait, as they
  do under hover. They resume only when the toast is neither hovered nor
  pressed. This gives touch a press-and-hold pause (WCAG 2.2.1), and it
  covers every timed toast, `custom` ones included.
- **The same `close` event.** A swipe dismissal is the button's dismissal by
  another path: no new event, prop, part or state.
- **The stack glides.** Whenever a toast arrives or leaves, by any path,
  `c-toasts` moves the toasts that change place from their old position to
  the new one. The glide starts with the exit: the leaving toast is pinned
  where it is, above its neighbours and out of the way of the pointer, while
  it fades. `close` still fires at the end of the exit. Under reduced motion
  the toasts move in one step.

## Alternatives considered

- **Swiping toward the stack's edge as well**, or only that way (Sonner,
  iOS): a touch that starts on a toast could no longer scroll the page, and
  a top-edge upward swipe meets the browser's own gestures.
- **Only toward a side stack's own edge:** closer to "off screen", but the
  working direction would depend on the placement.
- **Touch and pen only:** no conflict with mouse text selection, but a
  desktop user could never drag a toast.
- **Text the mouse cannot select** (`user-select: none`): nobody could copy
  an error message out of a toast.
- **A mouse drag only from outside the text:** keeps drag-selection, but the
  grab area is invisible.
- **A small fixed distance (45px)** dismisses on a nudge; **half the width**
  is a 320px drag on a desktop toast.
- **Swipe for custom toasts:** they have no dismiss button, so the swipe
  would be their only user dismissal.
- **Pausing only while dragging:** touch still could not pause a toast.
- **Gliding after the exit:** nothing overlaps, but every dismissal takes
  about 0.75s to settle.
- **`provide`/`inject` between the stack and its toasts:** it works across
  Vue custom elements, but no other component uses it. The stack exposes an
  internal `_`-prefixed method instead, as `c-radio` does for its group.

## Consequences

- `c-toast` and `c-toasts` gain their first specs and a visual baseline.
- A tap on a touch screen still leaves the toast paused until the next tap
  elsewhere: the browser's compatibility `mouseenter` holds it, as before. A
  press-and-hold ends the same way, so on touch the hold pauses the toast
  until the user taps somewhere else, not only while the finger is down.
- A touch press starts captured by the element under the finger. The claim
  moves capture to the host, and the inner element's `lostpointercapture`
  bubbles to the host, so the toast reacts only to a capture loss of its
  own.
- Chrome on Android cancels a long press on text after about half a second
  to start selection, which ends the press-and-hold pause there. Check this
  on a device before relying on the pause for long reads.
- Under `absolute`, a toast swiped away can overflow its container for the
  length of the exit.
