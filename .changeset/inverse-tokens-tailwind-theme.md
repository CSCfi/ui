---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

The Tailwind theme export (`@cscfi/csc-ui/css/tailwind-theme.css`) maps the
button variants' inverse tokens, so `text-inverse-secondary`,
`text-inverse-success`, `text-inverse-info` and `text-inverse-warning` work in
an app's own Tailwind build.
