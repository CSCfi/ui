---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-text-field` and `c-number-field` name their input from `label`, as the
other fields do. The visible label's `for` cannot reach an input in another
shadow root, so assistive technology announced these fields without a name.
