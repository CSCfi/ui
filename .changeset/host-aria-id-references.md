---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

ARIA attributes that hold element ids (`aria-controls`, `aria-labelledby`,
`aria-describedby`, `aria-owns`, `aria-activedescendant`, `aria-details`,
`aria-errormessage`, `aria-flowto`) stay on the component you set them on.
Copied onto the element inside it, they pointed at nothing, since an id inside
a component cannot reach your page's elements.
