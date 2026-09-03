---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Restore the coloured `on-*-subtle` ink in dark mode.

The dark-mode retune (alpha.8) moved the `on-*-subtle` ink to the near-white
`*-50` step, which turned alert icons and headings white: `c-alert` paints
them with that ink on an alpha wash over the surface, not on the solid
subtle fill. The ink returns to the coloured `*-200` step for every family.
Primary, secondary, info, error and link keep the `*-700` subtle fill; accent,
success and warning go back to `*-800` (hover `*-700`) so the pair still
clears WCAG AA. Every `on-*-subtle / *-subtle` pair passes the strict
contrast audit (4.74:1–6.49:1).
