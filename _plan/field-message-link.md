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
