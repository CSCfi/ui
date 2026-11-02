---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`autocorrect="off"` on `c-text-field` turns autocorrection off, as on a native
input and as in 3.x. It used to turn it on, because the prop took only a
boolean. The attribute now takes `on` and `off`, and the property also takes
`true` and `false`.
