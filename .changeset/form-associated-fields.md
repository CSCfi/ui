---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

The form fields take part in a native `<form>`, as built-in controls do. Each
submits its value under its `name` (`new FormData(form)` and a posted form
include it), `form.reset()` returns it to the value its markup set, and a
disabled `<fieldset>` disables it. A form without `novalidate` now stops its
submit on a `required` field left empty, bad input, a number out of range, an
incomplete mask or a partly filled code, with the browser's own message; add
`novalidate` where your app validates the form itself. Enter in a text, number,
code or closed picker field now submits the form, as in a native field: through
its first `<c-button type="submit">`, or, with no submit button, when the form
has one text field. Handle the form's `submit` (`@submit.prevent`) so it does
not reload the page, and cancel the Enter keydown where Enter should not save. `c-switch`,
`c-radio-group`, `c-otp-input` and `c-button-group` gain `name`;
`c-file-upload` stays out of forms. `c-button` acts on the form its `form`
attribute names, and a disabled `<fieldset>` disables `c-button` and
`c-icon-button`.
