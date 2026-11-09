---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Password managers can fill a `c-text-field`: write the `<input>` inside it,
`<c-text-field label="Password"><input autocomplete="current-password"
name="password" type="password"></c-text-field>`. The input stays in the
page, where Safari's, Firefox's and the extensions' password managers find
it, and the field frames it with its label, message and password toggle. The
input's own attributes apply, and in a form it submits and validates itself.
This replaces 3.x's `c-text-field-open`.
