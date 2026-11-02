---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A `loading` `c-icon-button` is announced as busy and unavailable
(`aria-busy`, `aria-disabled`), and keeps its slotted content in place, hidden
visually: visually hidden text that names the button no longer disappears
while it loads.
