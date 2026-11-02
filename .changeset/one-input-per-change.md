---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`input` now fires once per value change. A native `input` from inside a
component no longer reaches the page beside the component's own: a text or
number field sent two per keystroke, and the date, time and colour pickers
sent one per keystroke although their value changes only when the typed text
is committed. Inputs of your own slotted into a component reach the page as
before.
