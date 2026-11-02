---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-otp-input` fixes:

- `hide-details` hides the hint and the error message.
- Clearing a box in the middle ends the value there; the digits after it no
  longer move up into its place in the value.
- Only digits are taken: a typed space, and a pasted `1e5`, `0x1F`, `-12` or
  `1.5`, are no longer accepted. Spaces and line breaks around a pasted code
  are skipped.
- Changing `length` after the field mounts lays out the new number of boxes.
- The field no longer adds or removes an `error` class on the element, which
  removed a class of that name you had set yourself.
