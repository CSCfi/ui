---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-button` and `c-icon-button` have a `variant` prop that sets the button's
colour in every appearance: `primary` (the default), `secondary`, `success`,
`info`, `warning` or `danger`. An app can change the default for every button
with `applyDefaults({ 'c-button': { variant: 'secondary' } })`; the buttons the
library draws inside its own components stay `primary`.

```html
<c-button variant="danger">Delete</c-button>
<c-button appearance="outlined" variant="success">Approve</c-button>
```

The `danger` boolean attribute is deprecated: it keeps working until 5.0,
`variant` wins when both are set, and it now colours the outlined, ghost and
text appearances too. A pressed toggle button fills with its variant.

The label of an outlined, ghost or text button is a darker teal in light mode
and a lighter one in dark mode, so it meets WCAG AA contrast on its tint and
hover; in dark mode it read 3.8:1 on hover.
