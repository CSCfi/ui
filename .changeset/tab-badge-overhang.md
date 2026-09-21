---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix a `c-badge` slotted into a `c-tab` being cut off. The badge is a corner
overlay that paints 8px outside its parent, and the tab clipped it three times
over — on the tab's inner content box, on the tab element itself, and again on
the tab strip's viewport. The tab now clips with a margin wide enough for the
badge, the redundant second clip on the tab element is gone, and the strip's
viewport allows the same overhang while still hiding the tabs that scroll past
it. Badges in tabs now behave like badges in `c-button` and `c-icon-button`.
