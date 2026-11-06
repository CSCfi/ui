---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

A password manager can read a `c-button` submit button: write the `<button>`
inside it, `<c-button><button type="submit">Create account</button></c-button>`.
The button stays in the page, where a manager that reads a form's submit
button finds it — Proton Pass offers no password to generate on a sign-up
form otherwise — and the `c-button` paints it with its appearance, variant,
size and loading state. The button's own attributes apply, and it submits its
form natively. Use it for the submit button of a sign-up, log-in or
change-password form.
