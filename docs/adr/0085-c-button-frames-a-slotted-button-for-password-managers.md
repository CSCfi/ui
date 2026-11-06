# 85. c-button frames a slotted button for password managers

Date: 2026-11-06

## Status

Accepted. Lands before `4.0.0`, with ADR-0083 and ADR-0084
(`_plan/forms-and-autofill.md`).

## Context

A password manager decides what a form is for — logging in, signing up,
changing a password — and offers what fits: a generated password only on a
sign-up or change form. Proton Pass reads the form's submit button for it,
found with `form.querySelectorAll('button[type=submit], …')`, which cannot
reach the native button in `c-button`'s shadow root.

The Autofill Bench (`_plan/forms-and-autofill.md`, phase 0) ran the same
sign-up form, its inputs slotted into `c-text-field` (ADR-0083), with every
combination of a "Create account" heading, page title and a password named
`new-password`. Proton Pass, in Chrome and Firefox, offered nothing on any of
them while the submit button was a `c-button`, and offered a password on the
same form with a native `<button type="submit">`. 1Password, Dashlane and the
built-in managers of Chrome, Firefox and Safari filled every variant. ADR-0083
had left a slotted button out on the strength of one spike page where a
heading seemed enough; the bench did not reproduce it.

## Decision

- **A consumer-written `<button>` in `c-button`'s default slot is the
  button** — the **slotted button**. `c-button` paints its look around it and
  renders no button of its own: its shadow root's `root` part becomes a
  non-interactive box, and the button fills it, so the native button is the
  whole hit area, the focus target and the form's submit button.
- **Its native attributes are the consumer's**, as on the slotted input
  (ADR-0083): `type`, `disabled`, `name`, `value` and `form` are written on
  the button and act natively — it submits or resets its form, a disabled
  `<fieldset>` disables it, Enter in a field reaches it. `c-button`'s `type`,
  `disabled`, `href`, `target` and `value` are ignored while a button is
  slotted, with a console warning when one is set.
- **`c-button` keeps the look**: `appearance`, `variant`, `size`,
  `inverted`, `fit`, `no-radius`, the ripple and `loading`. The disabled look
  follows the button's own `:disabled`. `loading` shows the spinner, hides
  the label and cancels the button's clicks — a press, a key and Enter in a
  field alike — while the button stays enabled. The `icon` and `description`
  slots don't apply (an icon goes inside the button), with a console warning.
- **`c-button` stamps only its styling class.** The button's name is its own
  text; the host's id references (`aria-describedby`…) reach it as on any
  button (ADR-0078).
- **Styling is a document sheet scoped to the tag**, injected once per
  document and unlayered — the slotted input's pattern (ADR-0083, ADR-0037).
  The colours, focus ring and padding come from the private custom
  properties `c-button` sets on `root`, which the button inherits through the
  slot.
- **Use it for the submit button of a form a password manager reads**: sign
  up, log in, change password. Every other form keeps
  `<c-button type="submit">`.

## Considered options

- **Document the gap** and leave Proton Pass users without a generated
  password on csc-ui sign-up forms: no work, but the gap stays.
- **Host props forwarded onto a bare slotted button**, so
  `<c-button type="submit" :disabled>` keeps working around a `<button>`: the
  button would rewrite a node the consumer's framework owns, the option
  ADR-0083 rejected for the input.
- **The button in the label's place**, with `c-button`'s padding forwarding
  clicks and its focus ring drawn by script: the `icon` and `description`
  slots would carry over, but the native hit area is only the label.
- **The component adds a native button to its own light DOM**: Vue's
  hydration removes it (ADR-0083), and a hidden one is invisible to a manager
  that checks what it reads is visible.
- **A heading, page title or field name naming the form's purpose**: the
  bench's Proton Pass ignored all three.

## Consequences

- `c-button`'s default slot takes a `<button>` as well as a label. The
  `c-text-field` usage doc's password-manager example submits through one.
- The implicit submission of csc-ui fields (ADR-0084) clicks the slotted
  button as the form's default button; the browser's own implicit submission
  reaches it too.
- Specs assert the parity that a password manager cannot be driven to check:
  the button stays a light-DOM child with the consumer's attributes, submits
  its form natively, and paints like `c-button` in every appearance. The
  managers are checked by hand on the bench, where Proton Pass offered a
  password on the sign-up form submitted through a slotted button (S8).
