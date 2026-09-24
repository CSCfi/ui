---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix overlays opening in the wrong place in browsers without CSS anchor
positioning, such as Firefox 140 ESR. Menus and submenus, tooltips, popovers
and the `c-select`, `c-autocomplete` and `c-tree-select` panels now open against
their trigger there too, flip like they do elsewhere when there is no room, and
follow the trigger on scroll. `@oddbird/css-anchor-positioning` is no longer a
dependency; `@floating-ui/dom` takes its place and loads only in those browsers.
