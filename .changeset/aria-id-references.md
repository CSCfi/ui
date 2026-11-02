---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`aria-labelledby`, `aria-describedby`, `aria-controls` and the other ARIA
attributes that point at elements by id now work on the components. They did
nothing before: each component now hands the elements the ids name to its
control (a field's input, a button, a dialog, a tablist, a landmark). `c-modal`
and `c-popover` can be named by `aria-labelledby` pointing at a title in their
content. Without a `label`, `c-button-group` and `c-tags` become a named group
when `aria-label` or `aria-labelledby` is set.
