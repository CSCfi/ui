---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-select` on a narrow viewport no longer moves its field into the fullscreen
panel: the panel is the heading row (the field's label and a close button) and
the options, the same shape as `c-tree-select`. The moved field repeated the
label and spent a row of a phone screen on a readonly control, and focusing it
during the open was one of the things that scrolled the page behind the panel.
Focus now lands on the list inside the panel (the highlighted row when there is
a selection).
