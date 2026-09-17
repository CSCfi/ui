---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

An option's label resolution honours an explicit empty `name`: a `<c-option>`
authored with `name=""` now has an empty label, and the field falls back to
its own last resort (the raw value), instead of the empty string being
treated as absent and the option's text content taking over. Only a `name`
that was never set (the property and attribute both missing) falls through to
`c-option-value` or the option's text, as before.
