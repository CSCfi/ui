---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Separator lines are now visible on dark-mode overlay surfaces (ADR-0036).
`c-divider` inside `c-menu` and the search-row line in `c-autocomplete`'s
panel used the `border` token, which in dark mode resolves to the same color
as the panel background. Both now paint a new `divider` semantic token — a
translucent ink (black @ 12% in light mode, white @ 12% in dark) that reads
consistently on every surface. The token is exported as `--c-divider` and,
via the Tailwind theme export, as the `divider` color utilities.
