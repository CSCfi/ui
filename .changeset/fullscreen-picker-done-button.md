---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-date-picker, c-time-picker: on a narrow viewport the fullscreen panel now
ends in a Done button. Picks only select there, and nothing is emitted until
Done commits them and closes the panel; the close button and Escape discard
them. The Today and Now buttons select the same way. The anchored panel is
unchanged.
