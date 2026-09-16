---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-button`'s ripple is clipped to the same corner shape as the button. The
clip inherited the radius but not the squircle corner shape, so on browsers
with `corner-shape` the ripple bled past the painted corners.
