---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation-title`'s underline is visible again in light mode: it paints
a translucent `on-nav` ink instead of the page's `divider` ink, which is a
translucent black that vanished on the dark nav surface.
