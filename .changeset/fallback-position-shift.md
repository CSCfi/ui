---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix popovers, menus, tooltips and field lists running off the edge of the
screen in browsers without CSS anchor positioning (Firefox 140 ESR) when they
don't fit beside their trigger, for example a wide popover on a phone. They now
stay inside the viewport and pick the same placement as in other browsers.
