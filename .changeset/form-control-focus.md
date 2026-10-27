---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`focus()` on a form control now focuses it. The element renders no box of
its own, so calling `focus()` on a field, `c-checkbox`, `c-switch`,
`c-slider`, `c-radio-group`, `c-button-group`, `c-otp-input` or
`c-file-upload` did nothing; each now focuses its input or combobox, its
checked radio or selected button, its first digit box or its drop zone. After
a failed submit, an app can move focus to the first invalid field, and a
screen reader reads its error message.
