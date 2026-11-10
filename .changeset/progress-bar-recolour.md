---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-progress-bar`'s colours can be restyled with `::part()`. The new
`::part(track)` is the progress track the bar grows along: its
`background-color`, its `height`, and its `padding`, the frame around the bar.
`::part(bar)` is the bar showing the value, the indeterminate sweep included.
**`::part(bar)` used to name the track: move such a rule to `::part(track)`.**

The bar draws with plain elements instead of a native `<progress>`, so it
looks the same in every browser and, on the page or inside an alert or a data
table row, as before. In a forced-colors mode (Windows High Contrast) the bar
paints the system highlight colour.
