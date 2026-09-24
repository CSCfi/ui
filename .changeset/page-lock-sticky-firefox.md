---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix sticky toolbars and side navigation vanishing in Firefox 140 ESR while a
`c-select` list, a `c-modal` or a fullscreen field panel is open on a scrolled
page. The shared page scroll lock shifted the body up by the scroll offset,
and Firefox left sticky content at its in-page position, far above the
viewport. The locked body now scrolls itself to the offset instead, so sticky
content stays pinned in every browser and nothing visibly moves.
