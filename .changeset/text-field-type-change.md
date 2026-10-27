---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-text-field` follows a `type` changed after it mounts: the input takes the
new type, and a `password` or `date` field gets its toggle button. The type was
read once, when the field mounted.
