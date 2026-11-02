---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A `loading` `c-switch` ignores toggles and is announced as busy and
unavailable (`aria-busy`, `aria-disabled`), as a loading `c-button` is; it used
to keep toggling under its spinner.
