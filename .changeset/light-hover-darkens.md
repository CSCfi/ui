---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

In light mode, a filled primary, secondary or danger button keeps its white
label at WCAG AA contrast while hovered: its hover fill darkens instead of
lightening (`--c-primary-hover`, `--c-secondary-hover` and `--c-error-hover`
moved to step 600). The label read as low as 2.5:1 on the lighter fill. The
pickers' Done buttons, their selected cells and an active `c-tag` hover the
same way.
