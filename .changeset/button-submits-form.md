---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`<c-button type="submit">` submits the form around it again, and
`type="reset"` resets it, as they did in 3.x; in 4.x alphas neither did
anything, since the native button inside the component belongs to no form.
