# Hints and error messages are linked to the control (decided 2026-10-27)

**Status 2026-10-27: done, b3cdd751.** c-dropdown still hides the message while the select's field is in its
open panel (it sets c-input's `data-hide-details`), so c-input keeps that channel and leaves the `message` slot
out under it. Full browser suite, node 435, docs smoke with axe 509/509; screenshots unchanged.

**Decision (user, 2026-10-27): `aria-describedby`.** A side agent asked to confirm that fields never link their
hint / error text to the input. Confirmed: the 8 c-input fields render the message inside c-input's shadow root
(a tree nested in the field's, which neither an id nor element reflection can reach), with no
`aria-describedby`, `aria-description` or live region; c-checkbox, c-radio-group and c-file-upload render it in
their own tree but do not link it; only c-otp-input does. Screen readers announce the name and never the hint
or the error (WCAG 1.3.1 / 3.3.1 in practice); axe does not flag it.

## Change

- c-input (internal) stops drawing the message and offers a `message` slot at its place; its `hint`,
  `error-message`, `hide-details` / `data-hide-details` inputs go.
- Each field (text, number, select, autocomplete, tree select, the color picker's swatch field, and the
  TypedField shell of the date / time / color pickers) renders the shared `FieldMessage` into that slot, with
  an id, `part="message"` and a `labelOnTop` variant (c-input's `px-0`), and points the input's
  `aria-describedby` at it (while details are shown). The fields thereby gain a working `message` part
  (c-input's was never exported): additive, documented with `@csspart`.
- c-checkbox, c-radio-group, c-file-upload: an id on the message they render, `aria-describedby` on the
  control (the checkbox input, the radiogroup, the drop zone button).
- Screenshots must stay pixel-identical (same classes, same 200ms slide).
- New errors are not announced as they appear: that stays the app's job (focus an error summary on submit).

Spec: value-controls — every value control with a `hint` describes a role-bearing control with its hint, and
with its error message while invalid.

## Follow-up: moving focus to a field (user decision 2026-10-27: a `focus()` method)

A side agent noted that a new error is announced to no one, so after a failed submit the app should move focus
to the first invalid field. Probing showed it could not: `host.focus()` did nothing on all 19 value controls (the
host renders no box, nothing delegates). Rejected: `delegatesFocus` (it also moves focus on clicks on
non-focusable parts, including inside the select and picker panels, and misses c-radio-group's slotted radios).
Built: an exposed `focus(options?)` on the 15 form controls (value controls minus `NOT_FORM_CONTROLS`:
c-accordion, c-modal, c-pagination, c-tabs), focusing the control or the group's tab stop; value-controls asserts
it. Getting started shows the focus-the-first-invalid-field pattern.

Found by a side agent while building it: Vue defines exposed members on the element once, at the first mount,
as non-configurable getters bound to that instance, so after a remount every exposed member (`startUploads()`,
`unmaskedValue`, `badInput`, c-radio's `_syncGroupState`, the new `focus()`) reached the unmounted instance,
with a dev warning per member. Fixed centrally in defineElement (`withLiveExposed`: `expose` taken over, one
configurable accessor per member reading the instance mounted now); the focus conformance test re-adds every
form control.
