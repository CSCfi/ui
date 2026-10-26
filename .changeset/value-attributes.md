---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

The manifest, the IDE data and the element docs list a `value` attribute on
`c-select`, `c-autocomplete`, `c-accordion` and `c-button-group`, typed with
its string and number form (`value="fi"`). The attribute always worked, as it
did in 3.x, but went undocumented because the property also takes objects and
arrays.
