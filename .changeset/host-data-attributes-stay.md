---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`data-*` attributes set on a component stay on the component: they are no
longer copied onto the element inside it, so a selector such as
`[data-test="save"]` (in Playwright, which looks inside shadow roots too)
matches the component alone.
