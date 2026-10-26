---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Tokens that nothing should depend on are removed:

- the `ring` semantic role (`--c-ring` and the `ring-*` colour utility); no
  component painted it;
- the Stencil-era `--c-text-dark`, `--c-text-light`, `--c-text-body`,
  `--c-text-system` and `--c-transparent`. Use the semantic roles, such as
  `--c-on-surface` and `--c-on-surface-muted`, which follow dark mode.
  `c-pagination` and `c-navigation-button`, which still used
  `--c-text-system`, now use `on-surface-muted`, so their text reads in dark
  mode too.

`c-icon`'s `--c-icon-color` hook is private (`--_c-icon-color`), as every
per-component custom property is (ADR-0006): recolour an icon with its `color`
or through `::part(root)`.
