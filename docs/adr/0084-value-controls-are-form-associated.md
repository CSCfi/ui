# 84. Value controls are form-associated

Date: 2026-11-05

## Status

Accepted. Lands before `4.0.0`, with ADR-0083
(`_plan/forms-and-autofill.md`). Amends ADR-0023 (form association was out
of its scope), ADR-0071 (one of its reasons) and ADR-0075 (a form reset
emits).

## Context

No csc-ui control took part in a native `<form>`: a field's input lives in
its shadow root, where it has no form owner, so `new FormData(form)` and a
posted form missed every value, `form.reset()` reached nothing, a disabled
`<fieldset>` disabled nothing and Enter in a field submitted nothing.
ADR-0023 and ADR-0071 both left form association to "a library-wide
decision". `<c-button type="submit">` already submits the form around it
(195b86ba), so a form could be sent, empty. The question raised was whether
to add a `c-form` element that collects its children's values.

Form-associated custom elements (`static formAssociated = true` and
`ElementInternals`) let an element take part in a form as a built-in control
does. Every supported browser has them (Chrome 77, Firefox 98, Safari 16.4;
ADR-0077), and `defineElement` already subclasses Vue's element class.

## Decision

- **Fourteen value controls are form-associated**: `c-text-field`,
  `c-number-field`, `c-select`, `c-autocomplete`, `c-tree-select`, the date,
  time and colour pickers, `c-checkbox`, `c-switch`, `c-radio-group`,
  `c-slider`, `c-otp-input` and `c-button-group`. `name` names the form
  entry; the four without one gain it. `c-file-upload` stays out (ADR-0071's
  upload function carries its files), and `c-tabs`, `c-accordion`, `c-modal`
  and `c-pagination` hold values but are not form fields.
- **`c-button` and `c-icon-button` are form-associated without a value**: a
  disabled fieldset disables them, `form="id"` reaches them, and `c-button`'s
  submit and reset act on its form owner instead of the nearest `<form>` up
  the shadow roots. A button submits no `name=value` of its own:
  `requestSubmit()` takes only a native button as its submitter.
- **What submits** follows the native controls:
  - text-like fields (text, number, code, colour, a single date or time)
    always, `''` when empty, and a single-value select, autocomplete or
    tree select its pick, `''` without one, as a native select's empty
    option does;
  - a number as a plain JS number (`1234.5`), never the grouped text;
  - a checkbox or switch its value only while checked, `on` for a boolean
    model;
  - a radio group its pick, nothing without one;
  - **multiple** mode one entry per value under the one name, in value
    order; an item object its `value`;
  - a `range` date or time picker one ISO 8601 interval,
    `2026-11-01/2026-11-30` or `22:00/06:00`, with an empty side for a half
    range (`2026-11-01/`). One entry survives `Object.fromEntries`.
- **A validating form checks what the component knows.** Each control
  reports its validity: `required` and empty as a missing value, **bad
  input**, **out of range**, an **incomplete** mask and a partly filled
  `c-otp-input` (too short for its `length`); a `range` picker answers a
  `required` only with both ends. The browser's bubble
  anchors on the inner control; the field's own look still follows only
  `invalid`. `novalidate` turns all of it off.
- **A consumer's `invalid` is display only.** Reported as a custom error it
  would lock a form that validates on submit: the handler sets `invalid`, the
  user fixes the field, and the browser refuses every later submit, so the
  handler that would clear `invalid` never runs.
- **A form reset returns each control to its `value` (or `checked`)
  attribute as authored**, or to empty when there is none, and dispatches
  `update:value`
  and `input`, never `change`, so a bound model follows — a second exception
  to ADR-0075's "emit only on interaction", beside the upload settle. The
  attribute is read when the element first connects, before it upgrades:
  Vue's custom element writes every string, number or `true` prop back to its
  attribute, so afterwards the attribute follows the value. A value bound as
  a property is no attribute then, and resets to empty.
- **A disabled fieldset disables the control** — look and behaviour — while
  it is disabled, whatever its own `disabled`.
- **The fields submit on Enter themselves.** Enter in a single-line
  text-entry field with no panel open (`c-text-field` and its **slotted
  input**, `c-number-field`, `c-otp-input`, the pickers' value fields) runs
  the browser's implicit-submission rule, once the keydown has finished
  dispatching and unless the page cancelled it, with
  `<c-button type="submit">` counted as a submit button: the first submit
  button in tree order is the default, clicked, so a disabled or loading one
  stops it; with none, the form submits only when it has one text-like
  field. `c-autocomplete`, `c-select` and `c-tree-select` keep Enter for
  opening their list, but count as text fields.
- **One `attachInternals()` per element**: the call `useHostStates` owns
  becomes a shared composable both custom states and form association use.
- No back/forward state restore in 4.0.

## Considered options

- **A `c-form` element.** A `<form>` inside its shadow root cannot own the
  controls slotted into it (form ownership follows the light tree), so it
  would rebuild submission, Enter, reset, disabling and `FormData` by hand.
  It would not be a form to a server, nor to a password manager, which
  offers to save a password on a native submit. A new tag at RC besides.
- **An exported helper collecting c-* values by name**: cheap, but
  `new FormData(form)` and a posted form still miss them.
- **Status quo**: values from code, as the migration guide said.
- **A consumer's `invalid` as a custom error** with its `error-message` as
  the bubble text: every judgement in one place, but the lock-up above, for
  any form without `novalidate`.
- **Validity: `required` only, or never.** Never leaves a required c-* field
  submitting empty beside a slotted `<input required>` that blocks; required
  only leaves bad input and an incomplete mask submitting.
- **A silent reset** (native parity, as Material Web and Shoelace do):
  a `v-model` keeps the old value while the field shows the default. **The
  value held at connect** as the default: a value loaded after mount resets
  to the empty one.
- **A range as two names** (`<name>-start`, `<name>-end`) or **two entries
  under one name**: an invented naming convention, or one `Object.fromEntries`
  silently halves.
- **A hidden native submit button** in the form (3.x's c-button): a node the
  component adds to the consumer's `<form>`, which Vue's hydration removes
  (ADR-0083), and a second submitter to keep in step. **No implicit
  submission**: a login form would not submit on Enter.
- **The field showing the error inline** after a failed check, with or
  without the bubble: errors out of the box, but the library would write
  default error text the glossary says the consumer owns.

## Consequences

- In a form without `novalidate`, an empty required field now stops a
  `c-button` submit with the browser's bubble, and the form's `submit` event
  never fires, so a submit handler's own checks and messages do not run. Apps
  that validate their own forms add `novalidate`; MyCSC's forms are checked
  for it before this ships.
- Enter in a c-* text field inside a `<form>` now submits it, where before it
  only committed the value: a form without a submit handler reloads the page.
  MyCSC's forms are checked for a handled submit, and for where Enter should
  not save, before this ships; a page cancels it by cancelling the Enter
  keydown, as with a native field.
- The `name` docblocks that said "not form-associated, so it does not
  submit" are rewritten, and the four new `name` props join the manifest and
  the React wrappers.
- `setValidity()` needs a message for any failed flag: the inner native
  control's `validationMessage` where it holds the same constraint, else the
  browser's wording read off a detached native control holding it, so a
  bubble reads as a native field's would, in the browser's language.
- A form-association **conformance suite** enrols every form-associated tag:
  its `FormData` entry, reset, fieldset disabling and a required check.
- Follow-ups: a submit button's own `name=value`, state restore, and
  `c-file-upload` in a form.
