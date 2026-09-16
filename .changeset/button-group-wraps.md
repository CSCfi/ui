---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-button-group` wraps its buttons onto further rows when the track is
narrower than one row of them. The track was a single-row grid whose cells
could shrink below the buttons, so on a narrow viewport the buttons painted
over each other. The columns stay equal and as wide as the longest label; the
group keeps its natural one-row width where there is room.
