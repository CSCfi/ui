---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A click or Space on an indeterminate `c-checkbox` now clears `indeterminate`
and toggles the checkbox, as on a native checkbox. Before, the bar stayed and
screen readers kept announcing "mixed" until the page cleared the property,
even though the checkbox had changed. `indeterminate` reads `false` by the
time `change` fires; set it again if the options are still partly checked.
