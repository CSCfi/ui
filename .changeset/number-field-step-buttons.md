---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-number-field opens the numeric keyboard on phones, also in fields that take
negative numbers, and gains step buttons: up and down chevrons that move the
number by the new `step` prop (`1` by default) and repeat while held. The
arrow keys step too, and Page Up / Page Down move ten steps. Stepping snaps to
the step grid and stays within `min` and `max`. The buttons' accessible labels
can be translated with the new `texts` prop.
