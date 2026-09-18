---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tab-buttons` scrolls sideways inside `c-tabs` again. The tab row that
`c-tabs` slots the strip into may outgrow its viewport (that is how the
underlined tab row scrolls), so an overflowing strip pushed the row wide
instead of scrolling: the frame was clipped at the edge, the last tab was cut
off, and neither the edge arrows nor touch panning appeared — as seen on a
phone with three tabs. In buttons mode the row now squeezes the strip to its
own width, so the strip scrolls by touch, drag, wheel and the edge arrows as
documented.

The strip's corners clip correctly too: the scrolled buttons and the sliding
indicator are now cut by the track's own frame, following its squircle at the
inner edge of the hairline, instead of a round radius that ran 1px past it.
