---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-slider`'s value bubble now stays centred over the handle in Firefox. As the
slider moved, the bubble drifted up to 10px off the handle towards either end,
and the handle sat 12px inside the track's end tick marks. The slider's handle
now runs the same track in every browser.
