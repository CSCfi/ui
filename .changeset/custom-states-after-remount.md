---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Custom states (`:state(checked)`, `:state(bad-input)` …) keep following the
component after its element is taken off the page and put back, as KeepAlive
or a moved list item does. Until now they stopped updating there.
